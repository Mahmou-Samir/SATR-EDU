export type ExamQuestionType = "mcq";

export type ExamQuestion = {
  id: string;
  type: ExamQuestionType;
  prompt: string;
  options: string[];
  correctIndex: number;
  points: number;
};

export type ExamStatus = "draft" | "published";

export type PublicExamQuestion = {
  id: string;
  type: ExamQuestionType;
  prompt: string;
  options: string[];
  points: number;
};

export type ExamAnswer = {
  questionId: string;
  selectedIndex: number;
};
