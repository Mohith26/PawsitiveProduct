import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users } from "lucide-react";
import type { Course } from "@/lib/types/courses";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/learn/${course.slug}`}>
      <Card className="h-full transition-colors hover:bg-accent/50">
        {course.thumbnail_url && (
          <div className="aspect-video overflow-hidden rounded-t-lg bg-muted">
            <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{course.difficulty}</Badge>
            {course.category && <Badge variant="secondary">{course.category.name}</Badge>}
          </div>
          <CardTitle className="mt-2 line-clamp-2 text-lg">{course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.lesson_count} lessons</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrollment_count} enrolled</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
