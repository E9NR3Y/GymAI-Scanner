export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  muscleGroup: string;
  notes?: string;
  restTime?: number; // Seconds
}

export interface WorkoutPlan {
  id: string;
  title: string;
  dateCreated: string; // ISO Date string
  lastPlayed?: string; // ISO Date string of last session
  exercises: Exercise[];
}

export interface ThemeConfig {
  primary: string; // Hex code
  secondary: string; // Hex code
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  UPLOAD = 'UPLOAD',
  DETAILS = 'DETAILS',
}