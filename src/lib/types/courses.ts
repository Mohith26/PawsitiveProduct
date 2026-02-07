import type { Profile, CourseStatus, DifficultyLevel, LessonType } from "./database";

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface Course {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  difficulty: DifficultyLevel;
  status: CourseStatus;
  lesson_count: number;
  enrollment_count: number;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: CourseCategory;
  lessons?: Lesson[];
  creator?: Profile;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  lesson_type: LessonType;
  video_storage_path: string | null;
  video_duration_seconds: number | null;
  text_content: string | null;
  display_order: number;
  is_preview: boolean;
  created_at: string;
}

export interface CourseEnrollment {
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
}

export interface LessonProgress {
  user_id: string;
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
  video_position_seconds: number;
  completed_at: string | null;
  last_accessed_at: string;
}
