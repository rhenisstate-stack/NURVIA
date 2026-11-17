'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Clock, ArrowLeft } from 'lucide-react';
import { isNursingProgramSlug, NURSING_PROGRAMS } from '@/lib/programs/programRegistry';
import { useLiveExamActions } from '@/lib/contexts/web/assessment/live/useLiveExamActionContext';
import { examService, type ExamSubmissionType } from '@/lib/services/nexus/strata/examService';
import type { RendererQuestion } from '@/components/exam/renderers/types';
import { QuestionToolbar } from '@/app/web/(livexams)/partials/components/QuestionToolbar';
import { QuestionActionNavigator } from '@/app/web/(livexams)/partials/components/QuestionActionNavigator';
import { QuestionTypesDispatcher } from '@/app/web/(livexams)/partials/dispatcher/QuestionTypes';

const THEME_STYLES = {
  atlas: 'bg-slate-50 text-slate-900',
  cascade: 'bg-sky-50/40 text-slate-900',
  classic: 'bg-white text-slate-900',
  generic: 'bg-slate-100 text-slate-900',
  glacial: 'bg-cyan-50/40 text-slate-900',
  orbit: 'bg-indigo-50/30 text-slate-900',
  pulse: 'bg-teal-50/30 text-slate-900',
  zen: 'bg-stone-50 text-stone-900',
} as const;

type ExamTheme = keyof typeof THEME_STYLES;

function isExamTheme(value: string): value is ExamTheme {
  return Object.prototype.hasOwnProperty.call(THEME_STYLES, value);
}

const QUESTION_TYPE_TO_SUBMISSION: Record<string, ExamSubmissionType> = {
  '1': 'ActionSingleChoice',
  '18': 'ActionSingleChoice',
  singlechoice: 'ActionSingleChoice',
  multiplechoice: 'ActionSingleChoice',
  '2': 'ActionMultipleSelect',
  multipleresponse: 'ActionMultipleSelect',
  selectallthatapply: 'ActionMultipleSelect',
  sata: 'ActionMultipleSelect',
  '3': 'ActionTrueFalse',
  truefalse: 'ActionTrueFalse',
  '4': 'ActionBlankFill',
  fillintheblank: 'ActionBlankFill',
  cloze: 'ActionBlankFill',
  '5': 'ActionNumericResponse',
  numericresponse: 'ActionNumericResponse',
  numericcalculation: 'ActionNumericResponse',
  '6': 'ActionOrderingItem',
  orderedresponse: 'ActionOrderingItem',
  '7': 'ActionMatching',
  matching: 'ActionMatching',
  '8': 'ActionMatrixMultipleSelect',
  matrixgrid: 'ActionMatrixMultipleSelect',
  '9': 'ActionCaseBasedSingleChoice',
  clinicalcasestudy: 'ActionCaseBasedSingleChoice',
  unfoldingcasestudy: 'ActionCaseBasedSingleChoice',
  '10': 'ActionCaseBasedMatching',
  bowtie: 'ActionCaseBasedMatching',
  dynamiclabbowtie: 'ActionCaseBasedMatching',
  '11': 'ActionMatrixSingleChoice',
  multipletruefalse: 'ActionMatrixSingleChoice',
  '12': 'ActionDynamicImage',
  imagebased: 'ActionDynamicImage',
  '13': 'ActionMultipleImage',
  multipleimageselection: 'ActionMultipleImage',
  '14': 'ActionOrderingDragDrop',
  draganddrop: 'ActionOrderingDragDrop',
  '15': 'ActionOpenEnded',
  extendedresponse: 'ActionOpenEnded',
  '16': 'ActionMatrixMultipleSelect',
  tabularresponse: 'ActionMatrixMultipleSelect',
  '17': 'ActionOpenEnded',
  shortanswer: 'ActionOpenEnded',
  openended: 'ActionOpenEnded',
  '19': 'ActionAudioBased',
  audiobased: 'ActionAudioBased',
  '20': 'ActionVideoBased',
  videobased: 'ActionVideoBased',
  '21': 'ActionHighLight',
  highlight: 'ActionHighLight',
};

function resolveExamSubmissionType(rawType: string | number | undefined | null): ExamSubmissionType | null {
  if (rawType === undefined || rawType === null) return null;
  const key = String(rawType).trim().toLowerCase();
  if (!key) return null;
  return QUESTION_TYPE_TO_SUBMISSION[key] ?? null;
}

interface LiveExamPayload {
  id?: number;
  guidId?: string;
  name?: string;
  questions?: RendererQuestion[];
}

export default function LiveExamRunnerPage() {
  const router = useRouter();
  const params = useParams<{ program: string; theme: string }>();
  const searchParams = useSearchParams();

  const rawProgram = typeof params?.program === 'string' ? params.program : '';
  const rawTheme = typeof params?.theme === 'string' ? params.theme : '';
  const isValidRoute = isNursingProgramSlug(rawProgram) && isExamTheme(rawTheme);
  const identifier = searchParams.get('identifier') || '';

  const [exam, setExam] = useState<LiveExamPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    answers,
    flaggedQuestions,
    bookmarkedQuestions,
    toggleFlag,
    toggleBookmark,
    submitQuestionAnswer,
  } = useLiveExamActions();

  useEffect(() => {
    if (!isValidRoute) return;

    let active = true;
    async function loadExam() {
      if (!identifier) {
        setError('No exam identifier provided. Select an exam from your program dashboard.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/strata/examsLive?fetchtype=live&identifier=${encodeURIComponent(identifier)}`,
          { credentials: 'include' }
        );
        const json = await res.json().catch(() => ({}));
        if (!active) return;
        if (!res.ok) {
          setError(
            json?.message ||
              `Live exam session is not currently available (${res.status}).`
          );
        } else {
          const item = json?.data?.items?.[0] ?? json?.data ?? null;
          setExam(item);
        }
      } catch {
        if (active) setError('Unable to connect to live exam service.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadExam();
    return () => {
      active = false;
    };
  }, [identifier, isValidRoute]);

  if (!isValidRoute) {
    notFound();
  }

  const program = NURSING_PROGRAMS[rawProgram];
  const theme = rawTheme;
  const questions = exam?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const currentSubmissionType = currentQuestion
    ? resolveExamSubmissionType(currentQuestion.questionType)
    : null;
  const examId = Number(exam?.id ?? 0);
  const examGuidId = String(exam?.guidId ?? identifier);

  const handleSubmitExam = async () => {
    setSubmitting(true);
    try {
      await examService.submitExam({ examId, examGuidId });
      router.push(`/dashboards/${program.slug}/vista/assessment/exams/results/distinct`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${THEME_STYLES[theme]}`}>
      <header className="border-b border-slate-200 bg-[#142B4A] px-4 py-3 text-white sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboards/${program.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300">
                {program.shortTitle} · {theme} theme
              </p>
              <h1 className="text-sm font-bold">{exam?.name || 'Live Nursing Examination'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-200">
            <Clock className="h-4 w-4 text-[#0D9488]" />
            <span>Timed Session</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Loading live examination...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Live Exam Unavailable
            </div>
            <p className="mt-2">{error}</p>
            <Link
              href={`/dashboards/${program.slug}/vista/assessment/exams/absolute/overview`}
              className="mt-4 inline-block rounded-xl bg-[#142B4A] px-4 py-2 text-xs font-semibold text-white"
            >
              Return to Exams
            </Link>
          </div>
        )}

        {!loading && !error && currentQuestion && (
          <>
            <QuestionToolbar
              flagged={!!flaggedQuestions[currentQuestion.id]}
              bookmarked={!!bookmarkedQuestions[currentQuestion.id]}
              onToggleFlag={() => void toggleFlag(examId, examGuidId, 0, currentQuestion.id)}
              onToggleBookmark={() =>
                void toggleBookmark(examId, examGuidId, 0, currentQuestion.id)
              }
              currentTheme={theme}
              onSelectTheme={(nextTheme) =>
                router.push(
                  `/web/${program.slug}/vista/exam/${nextTheme}?identifier=${encodeURIComponent(
                    identifier
                  )}`
                )
              }
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-4 text-base font-medium leading-relaxed text-[#142B4A]">
                {currentQuestion.stem}
              </p>

              {currentSubmissionType ? (
                <QuestionTypesDispatcher
                  question={currentQuestion}
                  value={
                    typeof answers[currentQuestion.id] === 'string'
                      ? (answers[currentQuestion.id] as string)
                      : null
                  }
                  onChange={(val) =>
                    void submitQuestionAnswer(
                      currentSubmissionType,
                      examId,
                      examGuidId,
                      0,
                      '',
                      0,
                      currentQuestion.id,
                      val
                    )
                  }
                />
              ) : (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                >
                  <p className="font-semibold">Unsupported Question Type</p>
                  <p className="mt-1 text-xs">
                    This question cannot be rendered because its question type (
                    {String(currentQuestion.questionType ?? 'missing')}) is not supported.
                  </p>
                </div>
              )}
            </div>

            <QuestionActionNavigator
              currentIndex={currentIndex}
              total={questions.length}
              onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              onNext={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              onJump={setCurrentIndex}
              onSubmit={() => void handleSubmitExam()}
              submitting={submitting}
            />
          </>
        )}
      </main>
    </div>
  );
}
