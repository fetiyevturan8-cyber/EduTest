
export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Only stored in DB, stripped from session for security
  role: UserRole;
  createdAt: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Test {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  questions: Question[];
  isPublic: boolean;
  allowedClassIds: string[];
  allowMultipleAttempts: boolean;
  showFeedbackImmediately: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  isActive: boolean;
  createdAt: number;
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  code: string;
  studentIds: string[];
}

export interface TestAttempt {
  id: string;
  testId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
  answers: number[];
}

export interface DatabaseSchema {
  users: User[];
  tests: Test[];
  classrooms: Classroom[];
  attempts: TestAttempt[];
  version: string;
}
