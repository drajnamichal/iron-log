export type WorkoutType =
  | "push"
  | "pull"
  | "legs"
  | "fb_strength"
  | "fb_metabolic"
  | "fb_athletic";

export type ProgramId = "ppl" | "fullbody";

export type MuscleGroup =
  | "chest"
  | "shoulders"
  | "triceps"
  | "back"
  | "biceps"
  | "rear_delts"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "forearms"
  | "full_body";

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutTemplate {
  id: WorkoutType;
  name: string;
  label: string;
  color: string;
  exercises: ExerciseTemplate[];
}

export interface ProgramDefinition {
  id: ProgramId;
  name: string;
  shortName: string;
  description: string;
  author: string;
  workoutOrder: WorkoutType[];
  workouts: WorkoutTemplate[];
}

export interface ExerciseLog {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  planned_reps: number;
  actual_reps: number | null;
  weight_kg: number | null;
  completed: boolean;
  rpe: number | null;
  notes: string | null;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_type: WorkoutType;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  duration_minutes: number | null;
}

export interface BodyWeightEntry {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
}

export interface WorkoutSessionWithLogs extends WorkoutSession {
  exercise_logs: ExerciseLog[];
}
