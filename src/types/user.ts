export type IUser = {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  gradeLevel?: string;
  academicTrack?: string;
  interests?: string[];
  schoolName?: string;
  preferredLanguage?: string;
  studyGoals?: string;
  graduationYear?: string;
};
