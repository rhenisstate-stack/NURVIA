export interface RendererOption {
  id: string;
  optionIndex: number;
  optionText: string;
  displayOrder?: number;
  isCorrect?: boolean;
  specificRationale?: string;
  wasSelected?: boolean;
}

export interface RendererExhibit {
  id?: string;
  type: string | number;
  title: string;
  content: string;
  displayOrder?: number;
}

export interface RendererQuestion {
  id: string;
  orderIndex?: number;
  stem: string;
  questionType: string | number;
  cognitiveSkill?: string | number;
  clientNeedCategory?: string | number;
  options: RendererOption[];
  exhibits?: RendererExhibit[];
  contentJsonData?: string;
  generalRationale?: string;
}

export interface QuestionRendererProps {
  question: RendererQuestion;
  value?: string | null;
  onChange?: (val: string) => void;
  disabled?: boolean;
  isReview?: boolean;
}
