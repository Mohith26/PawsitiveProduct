import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/learn/progress-bar";
import { CheckCircle, Play, FileText } from "lucide-react";

interface Props {
  params: Promise<{ courseSlug: string }>;
}

export default async function CourseOverviewPage({ params }: Props) {
  const { courseSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select("*, category:course_categories(*), lessons(*)")
    .eq("slug", courseSlug)
    .single();

  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("user_id", user!.id)
    .eq("course_id", course.id)
    .maybeSingle();

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user!.id)
    .eq("course_id", course.id);

  const lessons = (course.lessons ?? []).sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order);
  const completedLessons = progress?.filter((p) => p.is_completed).length ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{course.difficulty}</Badge>
          {course.category && <Badge variant="secondary">{course.category.name}</Badge>}
        </div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      {enrollment ? (
        <ProgressBar completed={completedLessons} total={lessons.length} />
      ) : (
        <form action={async () => {
          "use server";
          const supabase = await (await import("@/lib/supabase/server")).createClient();
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from("course_enrollments").insert({
            user_id: user!.id,
            course_id: course.id,
          });
        }}>
          <Button type="submit" size="lg">Enroll in Course</Button>
        </form>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lessons ({lessons.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lessons.map((lesson: { id: string; title: string; lesson_type: string; display_order: number; is_preview: boolean }, index: number) => {
            const isCompleted = progress?.some((p) => p.lesson_id === lesson.id && p.is_completed);
            return (
              <Link
                key={lesson.id}
                href={enrollment ? `/learn/${courseSlug}/${lesson.id}` : "#"}
                className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {isCompleted ? <CheckCircle className="h-4 w-4 text-green-600" /> : index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{lesson.title}</p>
                </div>
                {lesson.lesson_type === "video" && <Play className="h-4 w-4 text-muted-foreground" />}
                {lesson.lesson_type === "text" && <FileText className="h-4 w-4 text-muted-foreground" />}
                {lesson.is_preview && <Badge variant="outline">Preview</Badge>}
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
