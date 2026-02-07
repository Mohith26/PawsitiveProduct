"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LessonPlayer } from "@/components/learn/lesson-player";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;
  const lessonId = params.lessonId as string;
  const { user } = useAuth();
  const supabase = createClient();

  const [lesson, setLesson] = useState<Record<string, unknown> | null>(null);
  const [course, setCourse] = useState<Record<string, unknown> | null>(null);
  const [lessons, setLessons] = useState<Record<string, unknown>[]>([]);
  const [progress, setProgress] = useState<Record<string, unknown> | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: courseData } = await supabase
        .from("courses")
        .select("*, lessons(*)")
        .eq("slug", courseSlug)
        .single();

      if (courseData) {
        setCourse(courseData);
        const sortedLessons = (courseData.lessons ?? []).sort(
          (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
        );
        setLessons(sortedLessons);

        const currentLesson = sortedLessons.find((l: { id: string }) => l.id === lessonId);
        setLesson(currentLesson ?? null);

        if (currentLesson?.video_storage_path) {
          const { data: signedUrl } = await supabase.storage
            .from("course-videos")
            .createSignedUrl(currentLesson.video_storage_path, 3600);
          setVideoUrl(signedUrl?.signedUrl);
        }

        if (user) {
          const { data: progressData } = await supabase
            .from("lesson_progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId)
            .maybeSingle();
          setProgress(progressData);
        }
      }
      setLoading(false);
    };

    fetch();
  }, [courseSlug, lessonId, user, supabase]);

  const handleProgress = useCallback(async (position: number) => {
    if (!user || !course) return;
    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: (course as { id: string }).id,
      video_position_seconds: position,
      last_accessed_at: new Date().toISOString(),
    });
  }, [user, course, lessonId, supabase]);

  const markComplete = async () => {
    if (!user || !course) return;
    await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: (course as { id: string }).id,
      is_completed: true,
      completed_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
    });
    setProgress({ ...progress, is_completed: true });
  };

  if (loading) return <div className="flex items-center justify-center p-8">Loading lesson...</div>;
  if (!lesson) return <div className="flex items-center justify-center p-8">Lesson not found.</div>;

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">{lesson.title as string}</h1>

      <LessonPlayer
        lesson={lesson as unknown as import("@/lib/types/courses").Lesson}
        videoUrl={videoUrl}
        initialPosition={(progress?.video_position_seconds as number) ?? 0}
        onProgress={handleProgress}
      />

      <div className="flex items-center justify-between">
        <div>
          {prevLesson && (
            <Button variant="outline" onClick={() => router.push(`/learn/${courseSlug}/${prevLesson.id}`)}>
              <ChevronLeft className="mr-1 h-4 w-4" />Previous
            </Button>
          )}
        </div>
        <Button
          onClick={markComplete}
          disabled={!!(progress as Record<string, unknown> | null)?.is_completed}
          variant={(progress as Record<string, unknown> | null)?.is_completed ? "secondary" : "default"}
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          {(progress as Record<string, unknown> | null)?.is_completed ? "Completed" : "Mark Complete"}
        </Button>
        <div>
          {nextLesson && (
            <Button variant="outline" onClick={() => router.push(`/learn/${courseSlug}/${nextLesson.id}`)}>
              Next<ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
