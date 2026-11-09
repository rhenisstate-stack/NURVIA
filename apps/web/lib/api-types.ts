export type ContentStatus =
  | 'Draft'
  | 'ValidationFailed'
  | 'PendingReview'
  | 'Approved'
  | 'Published'
  | 'Archived'
  | 'Rejected';

export type ExamStatus =
  | 'Draft'
  | 'Configured'
  | 'PendingReview'
  | 'Approved'
  | 'Published'
  | 'Archived';

export type QuestionType =
  | 'MultipleChoice'
  | 'MultipleResponse'
  | 'SelectAllThatApply'
  | 'TrueFalse'
  | 'FillInTheBlank'
  | 'Cloze'
  | 'NumericResponse'
  | 'NumericCalculation'
  | 'OrderedResponse'
  | 'Matching'
  | 'MatrixGrid'
  | 'ClinicalCaseStudy'
  | 'UnfoldingCaseStudy'
  | 'BowTie'
  | 'DynamicLabBowTie'
  | 'MultipleTrueFalse'
  | 'ImageBased'
  | 'MultipleImageSelection'
  | 'DragAndDrop'
  | 'ExtendedResponse'
  | 'TabularResponse'
  | 'ShortAnswer'
  | 'SingleChoice'
  | number;

export type NursingPathway = 'RN' | 'PN_LPN' | 'RN_Exit' | 'PN_Exit';

export type ExamCategory = 'ATI' | 'HESI' | 'RegularCourse' | 'Certification' | 'ExitPredictor';

export type DifficultyLevel = 'Foundational' | 'Intermediate' | 'Advanced' | 'Benchmark';

export type CognitiveSkill =
  | 'RecognizeCues'
  | 'AnalyzeCues'
  | 'PrioritizeHypotheses'
  | 'GenerateSolutions'
  | 'TakeActions'
  | 'EvaluateOutcomes';

export type ClientNeedCategory =
  | 'SafeEffectiveCareEnvironment'
  | 'HealthPromotionAndMaintenance'
  | 'PsychosocialIntegrity'
  | 'PhysiologicalIntegrity';

export type ExhibitType =
  | 'NursesNotes'
  | 'VitalSigns'
  | 'LabResults'
  | 'ProviderOrders'
  | 'RadiologyReport';

export type ExamDeliveryMode = 'Review' | 'Exam' | 'Tutor' | 'All';

export type ReviewReleasePolicy = 'Immediate' | 'ManualRelease';

export interface QuestionOptionDto {
  id?: string;
  optionIndex: number;
  optionText: string;
  isCorrect: boolean;
  specificRationale?: string;
  displayOrder: number;
}

export interface QuestionExhibitDto {
  id?: string;
  type: ExhibitType;
  title: string;
  content: string;
  displayOrder: number;
}

export interface QuestionReviewDto {
  id?: string;
  reviewerId: string;
  reviewerName: string;
  decision: 'Approved' | 'Rejected' | 'ChangesRequested';
  comments: string;
  reviewedAtUtc: string;
}

export interface QuestionVersionDto {
  id: string;
  versionNumber: number;
  stem: string;
  questionType: QuestionType;
  cognitiveSkill: CognitiveSkill;
  clientNeedCategory: ClientNeedCategory;
  generalRationale: string;
  contentJsonData?: string;
  status: ContentStatus;
  validationErrors?: string;
  reviewNotes?: string;
  createdAtUtc: string;
  createdBy: string;
  options: QuestionOptionDto[];
  exhibits: QuestionExhibitDto[];
  reviews: QuestionReviewDto[];
}

export interface QuestionDto {
  id: string;
  code: string;
  pathway: NursingPathway;
  category: ExamCategory;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: DifficultyLevel;
  status: ContentStatus;
  currentVersionId?: string;
  concurrencyToken: string;
  createdAtUtc: string;
  createdBy: string;
  updatedAtUtc?: string;
  updatedBy?: string;
  currentVersion?: QuestionVersionDto;
  versions?: QuestionVersionDto[];
  reviews?: QuestionReviewDto[];
}

export interface ExamBlueprintDto {
  id: string;
  examVersionId: string;
  targetQuestionCount: number;
  subjectDistributionJson?: string;
  cognitiveDistributionJson?: string;
  difficultyDistributionJson?: string;
}

export interface ExamQuestionDto {
  id: string;
  examVersionId: string;
  questionId: string;
  questionVersionId: string;
  orderIndex: number;
  points: number;
  question?: QuestionDto;
}

export interface ExamVersionDto {
  id: string;
  versionNumber: number;
  title: string;
  description: string;
  instructions: string;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  status: ExamStatus;
  validationErrors?: string;
  reviewReleasePolicy: ReviewReleasePolicy;
  reviewReleasedAtUtc?: string;
  createdAtUtc: string;
  createdBy: string;
  blueprint?: ExamBlueprintDto;
  examQuestions: ExamQuestionDto[];
}

export interface ExamDto {
  id: string;
  code: string;
  title: string;
  description: string;
  pathway: NursingPathway;
  category: ExamCategory;
  modeAllowed: ExamDeliveryMode;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  status: ExamStatus;
  currentVersionId?: string;
  totalQuestions: number;
  concurrencyToken: string;
  createdAtUtc: string;
  createdBy: string;
  updatedAtUtc?: string;
  updatedBy?: string;
  currentVersion?: ExamVersionDto;
  versions?: ExamVersionDto[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  statusCode?: number;
}

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ActiveExamOptionDto {
  id: string;
  optionIndex: number;
  optionText: string;
  displayOrder: number;
}

export interface ActiveExamQuestionDto {
  id: string;
  orderIndex: number;
  stem: string;
  questionType: QuestionType;
  cognitiveSkill: CognitiveSkill;
  clientNeedCategory: ClientNeedCategory;
  contentJsonData?: string;
  options: ActiveExamOptionDto[];
  exhibits: QuestionExhibitDto[];
}

export interface LearnerAnswerStateDto {
  responseJson?: string;
  isAnswered: boolean;
  isFlagged: boolean;
  savedAtUtc: string;
}

export interface StartAttemptResultDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  timeLimitMinutes: number;
  remainingSeconds: number;
  startedAtUtc: string;
  deadlineUtc: string;
  totalQuestions: number;
  questions: ActiveExamQuestionDto[];
  savedResponses: Record<string, LearnerAnswerStateDto>;
}

export interface AutosaveResponseRequest {
  questionId: string;
  responseJson?: string | null;
  isFlagged: boolean;
}

export interface AutosaveResultDto {
  questionId: string;
  isAnswered: boolean;
  isFlagged: boolean;
  savedAtUtc: string;
}

export interface ReviewOptionDto {
  id: string;
  optionIndex: number;
  optionText: string;
  isCorrect: boolean;
  specificRationale?: string;
  wasSelected: boolean;
}

export interface ReviewQuestionDto {
  questionId: string;
  orderIndex: number;
  stem: string;
  questionType: QuestionType;
  cognitiveSkill: CognitiveSkill;
  clientNeedCategory: ClientNeedCategory;
  generalRationale: string;
  learnerResponse?: string;
  isCorrect: boolean;
  pointsAwarded: number;
  maxPoints: number;
  options: ReviewOptionDto[];
  exhibits: QuestionExhibitDto[];
}

export interface SubmittedExamResultDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  status: string;
  startedAtUtc: string;
  submittedAtUtc: string;
  timeSpentSeconds: number;
  totalQuestions: number;
  correctQuestions: number;
  scorePercentage: number;
  passingScorePercentage: number;
  passed: boolean;
  reviewReleased: boolean;
  reviewQuestions: ReviewQuestionDto[];
}

export interface ExamAttemptSummaryDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  status: string;
  startedAtUtc: string;
  submittedAtUtc?: string;
  scorePercentage?: number;
  passed?: boolean;
  totalQuestions: number;
}
