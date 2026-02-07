"use client";

import { useEffect, useRef } from "react";
import type { Lesson } from "@/lib/types/courses";

interface LessonPlayerProps {
  lesson: Lesson;
  videoUrl?: string;
  initialPosition?: number;
  onProgress?: (position: number) => void;
}

export function LessonPlayer({ lesson, videoUrl, initialPosition = 0, onProgress }: LessonPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && initialPosition > 0) {
      videoRef.current.currentTime = initialPosition;
    }
  }, [initialPosition]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onProgress) return;

    const interval = setInterval(() => {
      onProgress(Math.floor(video.currentTime));
    }, 10000);

    return () => clearInterval(interval);
  }, [onProgress]);

  return (
    <div className="space-y-6">
      {videoUrl && (lesson.lesson_type === "video" || lesson.lesson_type === "both") && (
        <div className="aspect-video overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="h-full w-full"
            playsInline
          />
        </div>
      )}

      {lesson.text_content && (lesson.lesson_type === "text" || lesson.lesson_type === "both") && (
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: lesson.text_content }} />
        </div>
      )}
    </div>
  );
}
