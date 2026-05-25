export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseSubject =
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "arabic"
  | "english"
  | "programming"
  | "history";
export type CourseCategory =
  | "all"
  | "math"
  | "physics"
  | "chemistry"
  | "languages"
  | "programming"
  | "history";

export type CourseBadge = "bestseller" | "new" | "ai";

export type CourseItem = {
  id: string;
  subject: CourseSubject;
  level: CourseLevel;
  category: CourseCategory;
  rating: number;
  price: number;
  isFree: boolean;
  students: number;
  lessons: number;
  hours: number;
  badge?: CourseBadge;
  emoji: string;
  gradient: string;
  isNew?: boolean;
};

export const COURSE_CATALOG: CourseItem[] = [
  {
    id: "calculus",
    subject: "math",
    level: "intermediate",
    category: "math",
    rating: 4.9,
    price: 149,
    isFree: false,
    students: 2100,
    lessons: 24,
    hours: 18,
    badge: "bestseller",
    emoji: "🧮",
    gradient: "linear-gradient(135deg,rgba(56,29,109,.8),rgba(100,50,201,.4))",
  },
  {
    id: "mechanics",
    subject: "physics",
    level: "intermediate",
    category: "physics",
    rating: 4.8,
    price: 179,
    isFree: false,
    students: 1540,
    lessons: 20,
    hours: 16,
    badge: "ai",
    emoji: "🔭",
    gradient: "linear-gradient(135deg,rgba(20,20,60,.9),rgba(100,50,201,.25))",
  },
  {
    id: "biology",
    subject: "biology",
    level: "beginner",
    category: "chemistry",
    rating: 4.7,
    price: 139,
    isFree: false,
    students: 980,
    lessons: 18,
    hours: 14,
    emoji: "🧬",
    gradient: "linear-gradient(135deg,rgba(20,50,20,.8),rgba(100,180,60,.25))",
  },
  {
    id: "english",
    subject: "english",
    level: "intermediate",
    category: "languages",
    rating: 4.7,
    price: 99,
    isFree: false,
    students: 3200,
    lessons: 22,
    hours: 20,
    badge: "bestseller",
    emoji: "🌐",
    gradient: "linear-gradient(135deg,rgba(100,30,10,.6),rgba(255,118,76,.3))",
  },
  {
    id: "python",
    subject: "programming",
    level: "beginner",
    category: "programming",
    rating: 4.9,
    price: 0,
    isFree: true,
    students: 4100,
    lessons: 18,
    hours: 12,
    badge: "new",
    emoji: "💻",
    gradient: "linear-gradient(135deg,rgba(10,30,10,.8),rgba(80,180,60,.25))",
    isNew: true,
  },
  {
    id: "organic",
    subject: "chemistry",
    level: "advanced",
    category: "chemistry",
    rating: 4.8,
    price: 129,
    isFree: false,
    students: 1800,
    lessons: 20,
    hours: 15,
    badge: "ai",
    emoji: "⚗️",
    gradient: "linear-gradient(135deg,rgba(20,20,60,.9),rgba(100,50,201,.25))",
  },
  {
    id: "history",
    subject: "history",
    level: "beginner",
    category: "history",
    rating: 4.9,
    price: 0,
    isFree: true,
    students: 900,
    lessons: 16,
    hours: 10,
    emoji: "🏛️",
    gradient: "linear-gradient(135deg,rgba(56,29,109,.6),rgba(255,180,151,.2))",
  },
  {
    id: "trigonometry",
    subject: "math",
    level: "intermediate",
    category: "math",
    rating: 4.6,
    price: 119,
    isFree: false,
    students: 1350,
    lessons: 16,
    hours: 12,
    emoji: "📐",
    gradient: "linear-gradient(135deg,rgba(56,29,109,.8),rgba(100,50,201,.4))",
  },
  {
    id: "arabicEssay",
    subject: "arabic",
    level: "advanced",
    category: "languages",
    rating: 4.8,
    price: 89,
    isFree: false,
    students: 2600,
    lessons: 14,
    hours: 11,
    badge: "bestseller",
    emoji: "📚",
    gradient: "linear-gradient(135deg,rgba(50,20,10,.8),rgba(200,100,40,.3))",
  },
];

export const SUBJECT_FILTER_KEYS = [
  "math",
  "physics",
  "chemistry",
  "biology",
  "arabic",
  "english",
  "programming",
] as const;

export const LEVEL_FILTER_KEYS = ["beginner", "intermediate", "advanced"] as const;

export const CATEGORY_TABS: { key: CourseCategory; labelKey: string }[] = [
  { key: "all", labelKey: "all" },
  { key: "math", labelKey: "math" },
  { key: "physics", labelKey: "physics" },
  { key: "chemistry", labelKey: "chemistry" },
  { key: "languages", labelKey: "languages" },
  { key: "programming", labelKey: "programming" },
  { key: "history", labelKey: "history" },
];

export const PAGE_SIZE = 6;

export function getCourseById(courseId: string): CourseItem | undefined {
  return COURSE_CATALOG.find((course) => course.id === courseId);
}
