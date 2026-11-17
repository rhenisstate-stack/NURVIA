export const STRATA_TYPE = [
  'Category',
  'SubCategory',
  'Domain',
  'Program',
  'Course',
  'Subject',
  'Unit',
  'Lesson',
  'Topic',
  'Concept',
  'Fact',
  'Assessment',
  'Exam',
  'Section',
  'Question',
  'Institution',
  'School',
  'Department',
  'Division',
  'Cohort',
  'Class',
  'Document',
  'Cognition',
  'Content',
  'SystemUser',
] as const;

export const STRATA_STATUS = [
  'Draft',
  'Published',
  'Archived',
  'Inactive',
  'Active',
  'Inception',
  'Expired',
  'Destroyed',
  'Online',
  'Offline',
] as const;

export const STRATA_LEVEL = ['Beginner', 'Intermediate', 'Advanced'] as const;
export const STRATA_DIFFICULTY = [
  'Easy',
  'Medium',
  'Hard',
  'Beginner',
  'Intermediate',
  'Advanced',
] as const;

export const STRATA_TARGET = [
  'Cognition',
  'Students',
  'Praxis',
  'Admin',
  'Exams',
  'Institution',
] as const;

export const STRATA_SEGMENT = ['Exam', 'Practice', 'Theory'] as const;
export const STRATA_FRAGMENT = ['Module', 'Lesson', 'Unit'] as const;

export const STRATA_ORDER = [
  'AscendingNumerics',
  'DescendingNumerics',
  'AscendingRomans',
  'DescendingRomans',
  'Bulleted',
  'Random',
  'Alphabetical',
  'ReverseAlphabetical',
  'EvenFirst',
  'OddFirst',
  'Custom',
] as const;

export const STRATA_SEASON = ['Spring', 'Summer', 'Fall', 'Winter'] as const;
export const STRATA_LANGUAGE = ['English', 'French', 'Spanish'] as const;
export const STRATA_ACCESS_TYPE = ['Public', 'Restricted', 'Private'] as const;

export enum STRATA_GENERATION_MODE {
  DOCUMENT_BASED = 'document_based',
  KNOWLEDGE_BASED = 'knowledge_based',
  API_BASED = 'api_based',
  HYBRID_BASED = 'hybrid_based',
}

export enum STRATA_SOURCE_CONTROL {
  STRICT_SOURCE = 'strict_source',
  LIBERAL_SOURCE = 'liberal_source',
  EXTERNAL_SOURCE = 'external_source',
  HYBRID_SOURCE = 'hybrid_source',
}

export enum STRATA_QUESTION_TYPE {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_SELECT = 'multiple_select',
  TRUE_FALSE = 'true_false',
  CASE_BASED = 'case_based',
  HYBRID = 'hybrid',
}

export enum STRATA_DIFFICULTY_LEVEL {
  VERY_EASY = 'very_easy',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  VERY_HARD = 'very_hard',
  ADAPTIVE = 'adaptive',
  COMPLEX = 'complex',
  PROGRESSIVE = 'progressive',
  HYBRID = 'hybrid',
}
