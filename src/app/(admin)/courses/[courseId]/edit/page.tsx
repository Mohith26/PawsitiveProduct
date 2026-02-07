"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const supabase = createClient();

  const [course, setCourse] = useState<Record<string, unknown> | null>(null);
  const [lessons, setLessons] = useState<Record<string, unknown>[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      setCourse(courseData);

      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("display_order", { ascending: true });
      setLessons(lessonsData ?? []);
    };
    fetch();
  }, [courseId, supabase]);

  const saveCourse = async () => {
    if (!course) return;
    setSaving(true);
    await supabase
      .from("courses")
      .update({
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        status: course.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);
    setMessage("Course saved!");
    setSaving(false);
  };

  const addLesson = async () => {
    const { data } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        title: "New Lesson",
        display_order: lessons.length,
      })
      .select()
      .single();
    if (data) setLessons((prev) => [...prev, data]);
  };

  const updateLesson = async (lessonId: string, updates: Record<string, unknown>) => {
    await supabase.from("lessons").update(updates).eq("id", lessonId);
    setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)));
  };

  const deleteLesson = async (lessonId: string) => {
    await supabase.from("lessons").delete().eq("id", lessonId);
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  if (!course) return <div className="p-8">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Course</h1>

      <Card>
        <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={(course.title as string) ?? ""} onChange={(e) => setCourse({ ...course, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={(course.description as string) ?? ""} onChange={(e) => setCourse({ ...course, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={(course.difficulty as string) ?? "beginner"} onValueChange={(v) => setCourse({ ...course, difficulty: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={(course.status as string) ?? "draft"} onValueChange={(v) => setCourse({ ...course, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={saveCourse} disabled={saving}>{saving ? "Saving..." : "Save Course"}</Button>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Lessons ({lessons.length})</h2>
          <Button onClick={addLesson} size="sm" className="gap-1"><Plus className="h-4 w-4" />Add Lesson</Button>
        </div>
        {lessons.map((lesson, index) => (
          <Card key={lesson.id as string}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Lesson {index + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteLesson(lesson.id as string)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={(lesson.title as string) ?? ""}
                onChange={(e) => updateLesson(lesson.id as string, { title: e.target.value })}
                placeholder="Lesson title"
              />
              <Textarea
                value={(lesson.text_content as string) ?? ""}
                onChange={(e) => updateLesson(lesson.id as string, { text_content: e.target.value })}
                placeholder="Lesson content (markdown)"
                rows={4}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
