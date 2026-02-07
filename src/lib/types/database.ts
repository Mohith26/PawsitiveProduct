export type UserRole = "member" | "vendor" | "admin" | "super_admin";
export type IndustrySegment = "veterinary" | "cpg" | "retail" | "other";
export type CourseStatus = "draft" | "published" | "archived";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type LessonType = "video" | "text" | "both";
export type ProductStatus = "pending" | "approved" | "rejected";
export type AutonomyLevel = "human_in_the_loop" | "semi_autonomous" | "fully_autonomous";
export type LeadStatus = "new" | "contacted" | "in_progress" | "closed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  job_title: string | null;
  industry_segment: IndustrySegment;
  role: UserRole;
  bio: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
