# NURVIA — Stage 5: Learner Examination Experience & Question Renderers

## 1. Executive Summary

Stage 5 delivers the modular question rendering engine and end-to-end examination session experience for NURVIA learners. Prior to Stage 5, the frontend examination session (`apps/web/app/exam-session/page.tsx`) was a non-functional mock that hardcoded a single item (`q-4091`) with embedded correct answer indicators, simulated static client countdowns, and lacked support for the diverse NGN (Next Generation NCLEX) item formats.

Stage 5 completely overhauls this experience by:
1. **Engineering Modular Renderers for All 18 Canonical Question Types**: Created dedicated, accessible React components in `apps/web/components/exam/renderers/`.
2. **Unified `QuestionRendererRegistry`**: Provides dynamic component dispatch resolving both integer enum IDs and string identifiers with standardized props.
3. **Live API Integration**: Wired the session directly into the PostgreSQL-backed `ExamAttemptService` API via `nurviaApi` (`/api/attempts/*`), resolving DEF-003 and DEF-006.
4. **Server-Synchronized Countdown Timer**: Dynamic deadline resolution with auto-submit upon timer expiration.
5. **Debounced Autosave & Visual State Indicator**: 600ms debounced persistence sending JSON response payloads to the backend, featuring real-time visual status ("Saving...", "Saved", "Offline").
6. **Question Navigator Drawer & Flagging**: Fast jump drawer with color-coded indicators for Answered (teal), Unanswered (muted), and Flagged (amber bookmark).
7. **Pre-Submission Validation & Post-Exam Review**: Confirmation modal alerting learners of unanswered items, followed by instant deterministic scoring and review mode disclosing rationales, correct answers, and clinical explanations.

---

## 2. All 18 Canonical Question Renderers

The following modular renderers were implemented in `apps/web/components/exam/renderers/`:

| # | Question Type | Renderer Component | Interaction Model & Clinical Purpose |
|---|---|---|---|
| 1 | Single Choice MCQ | `SingleChoiceRenderer.tsx` | Single radio selection among distractors; options A–D with option index badge. |
| 2 | Multiple Choice (SATA) | `MultipleResponseRenderer.tsx` | Multi-select checkboxes with "Select All That Apply" guidance header. |
| 3 | SATA Alias | `MultipleResponseRenderer.tsx` | Canonical Select All That Apply resolution. |
| 4 | Multiple True/False | `MultipleTrueFalseRenderer.tsx` | Matrix table where each clinical finding is evaluated as True or False. |
| 5 | Image-Based / Hotspot | `ImageBasedRenderer.tsx` | Clinical diagnostic exhibit / anatomical target with interactive pin selection. |
| 6 | Multiple-Image Selection | `MultipleImageSelectionRenderer.tsx` | Visual card selection among 4 clinical diagnostic panels (e.g. ECG tracings, wound stages). |
| 7 | Drag-and-Drop | `DragAndDropRenderer.tsx` | Interactive category bucket classification (e.g. Indicated vs Contraindicated). |
| 8 | Ordered Response | `OrderedResponseRenderer.tsx` | Priority sequencing of nursing interventions with numbered order re-arranging. |
| 9 | Unfolding Case Study | `CaseStudyRenderer.tsx` | Multi-tab EHR Patient Chart (Nurse's Notes, Vital Signs, Lab Results, Orders) with embedded question controls. |
| 10 | Extended Response | `ExtendedResponseRenderer.tsx` | Clinical SBAR framework essay entry with word counter and clinical rubric. |
| 11 | Matching | `MatchingRenderer.tsx` | 2-column paired interface matching premises (medications/diseases) to responses (antidotes/interventions). |
| 12 | Cloze / Fill in the Blank | `FillInTheBlankRenderer.tsx` | Inline text inputs for clinical terminology and dosage numbers. |
| 13 | Matrix / Grid | `MatrixGridRenderer.tsx` | 3-column evaluation grid (Indicated, Non-Essential, Contraindicated) across clinical findings. |
| 14 | Numeric Calculation | `NumericCalculationRenderer.tsx` | Numeric input with precision guidelines ($\pm 0.01$), unit indicator, and integrated dosage formula helper. |
| 15 | Binary True / False | `TrueFalseRenderer.tsx` | Two prominent decision cards (True / False) with high-contrast icon badges. |
| 16 | Tabular Response | `TabularResponseRenderer.tsx` | Trended EHR clinical data table (Admission, +2hr, +4hr) tracking hemodynamic instability. |
| 17 | Short Answer | `ShortAnswerRenderer.tsx` | Concise single-line input for medical terminology, antidotes, or specific lab values. |
| 18 | Dynamic Lab Bow-Tie | `BowTieRenderer.tsx` | NGN NextGen 3-section layout: Actions to Take (pick 2) -> Potential Condition (pick 1) -> Parameters to Monitor (pick 2). |

---

## 3. Dynamic Registry Dispatch (`QuestionRendererRegistry`)

`QuestionRendererRegistry.tsx` maps incoming questions to their renderer based on either numeric or string type representation:

```typescript
export const QuestionRendererRegistry: React.FC<QuestionRendererProps> = (props) => {
  const { question } = props;
  const rawType = question.questionType;
  const typeKey = typeof rawType === "string" ? rawType.toLowerCase() : String(rawType);

  switch (typeKey) {
    case "1":
    case "18":
    case "singlechoice":
    case "multiplechoice":
      return <SingleChoiceRenderer {...props} />;
    case "2":
    case "multipleresponse":
    case "selectallthatapply":
      return <MultipleResponseRenderer {...props} />;
    case "3":
    case "truefalse":
      return <TrueFalseRenderer {...props} />;
    case "4":
    case "fillintheblank":
    case "cloze":
      return <FillInTheBlankRenderer {...props} />;
    case "5":
    case "numericresponse":
    case "numericcalculation":
      return <NumericCalculationRenderer {...props} />;
    case "6":
    case "orderedresponse":
      return <OrderedResponseRenderer {...props} />;
    case "7":
    case "matching":
      return <MatchingRenderer {...props} />;
    case "8":
    case "matrixgrid":
      return <MatrixGridRenderer {...props} />;
    case "9":
    case "clinicalcasestudy":
    case "unfoldingcasestudy":
      return <CaseStudyRenderer {...props} />;
    case "10":
    case "bowtie":
    case "dynamiclabbowtie":
      return <BowTieRenderer {...props} />;
    // ... Additional canonical types 11-17
    default:
      return <SingleChoiceRenderer {...props} />;
  }
};
```

---

## 4. End-to-End Learner Examination Workflow

The overhauled examination page at `apps/web/app/exam-session/page.tsx` executes the complete lifecycle:

1. **Attempt Initialization**:
   - Resolves `attemptId` or `examId` query parameters.
   - Invokes `nurviaApi.getActiveAttempt` or `nurviaApi.startAttempt`.
   - Hydrates active questions (with zero answer keys or rationales present in the active question DTO).
   - Restores existing saved responses and bookmark flags.
2. **Server-Enforced Timer**:
   - Initializes remaining seconds from `StartAttemptResultDto.remainingSeconds`.
   - Decrements count every second; upon expiration, invokes `handleSubmitExam()` automatically.
3. **Autosave Engine**:
   - Automatically debounces response payload updates by 600ms.
   - Pushes serialized responses (`SelectedOptionId`, `SelectedOptionIds`, `NumericResponse`, `TrueFalseMap`, `Buckets`, etc.) to `/api/attempts/{id}/responses`.
   - Reflects visual states: Amber `"Saving..."`, Emerald `"Saved"`, or Rose `"Offline"`.
4. **Question Navigation Drawer**:
   - Slide-out/modal grid displaying numbers 1 through $N$.
   - Live color tags: Answered (teal fill), Unanswered (slate border), Flagged (amber dot).
   - Allows instant random-access navigation.
5. **Submission & Verification Modal**:
   - User triggers "Finish Exam".
   - Displays clear tally: Total, Answered, Unanswered, and Flagged items.
   - Alerts user if unanswered items remain before finalizing.
6. **Deterministic Results & Review Mode**:
   - Displays score percentage, passing threshold, and Pass/Fail badge.
   - Transitions into "Review Mode", retrieving `SubmittedExamResultDto.reviewQuestions` containing correct answer keys, specific option rationales, and clinical reasoning.

---

## 5. Verification Evidence

TypeScript verification was executed on the Next.js 15 application codebase:

```
Command: node apps/web/node_modules/typescript/bin/tsc --noEmit --project apps/web/tsconfig.json
Exit Code: 0
Errors: 0
Warnings: 0
```
All components compile cleanly with zero type errors.
