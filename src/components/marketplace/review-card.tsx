import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ProductReview } from "@/lib/types/marketplace";

interface ReviewCardProps {
  review: ProductReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const authorName = review.author?.full_name ?? "Anonymous";
  const initials = authorName.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="space-y-2 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.author?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{authorName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
      </div>
      {review.title && <p className="font-medium">{review.title}</p>}
      {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
    </div>
  );
}
