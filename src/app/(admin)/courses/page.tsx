import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { CreateCourseDialog } from "@/components/admin/create-course-dialog";
import type { CourseCategory } from "@/lib/types/courses";

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*, category:course_categories(*)")
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("course_categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <CreateCourseDialog categories={(categories ?? []) as CourseCategory[]} />
      </div>

      <div className="space-y-4">
        {courses?.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={course.status === "published" ? "default" : "secondary"}>
                    {course.status}
                  </Badge>
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Edit className="h-3 w-3" />Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{course.lesson_count} lessons</span>
                <span>{course.enrollment_count} enrolled</span>
                <span>{course.difficulty}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!courses || courses.length === 0) && (
          <p className="text-center py-8 text-muted-foreground">No courses yet.</p>
        )}
      </div>
    </div>
  );
}
