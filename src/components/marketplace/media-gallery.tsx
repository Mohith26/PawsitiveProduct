"use client";

import { useState } from "react";
import type { ProductMedia } from "@/lib/types/marketplace";

interface MediaGalleryProps {
  media: ProductMedia[];
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (media.length === 0) return null;

  const activeMedia = media[activeIndex];

  return (
    <div className="space-y-3">
      <div className="aspect-video overflow-hidden rounded-lg bg-muted">
        {activeMedia.media_type === "image" ? (
          <img src={activeMedia.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <video src={activeMedia.url} controls className="h-full w-full" />
        )}
      </div>
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                index === activeIndex ? "border-primary" : "border-transparent"
              }`}
            >
              {item.media_type === "image" ? (
                <img src={item.url} alt="" className="h-16 w-24 object-cover" />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center bg-muted text-xs">Video</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
