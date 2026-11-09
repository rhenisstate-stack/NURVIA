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
  | 'TrueFalse'
  | 'FillInTheBlank'
  | 'NumericResponse'
  | 'OrderedResponse'
  | 'Matching'
  | 'MatrixGrid'
  | 'ClinicalCaseStudy'
  | 'BowTie';

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
}
