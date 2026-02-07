"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VerifiedBadge } from "@/components/marketplace/verified-badge";
import { MediaGallery } from "@/components/marketplace/media-gallery";
import { ReviewCard } from "@/components/marketplace/review-card";
import { HireExpertModal } from "@/components/marketplace/hire-expert-modal";
import { Star, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { MarketplaceProduct, ProductMedia, ProductFeature, ProductReview } from "@/lib/types/marketplace";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.productSlug as string;
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: productData } = await supabase
        .from("marketplace_products")
        .select("*, vendor:profiles(*)")
        .eq("slug", slug)
        .single();

      if (productData) {
        setProduct(productData as unknown as MarketplaceProduct);

        const [mediaRes, featuresRes, reviewsRes] = await Promise.all([
          supabase.from("product_media").select("*").eq("product_id", productData.id).order("display_order"),
          supabase.from("product_features").select("*").eq("product_id", productData.id),
          supabase.from("product_reviews").select("*, author:profiles(*)").eq("product_id", productData.id).order("created_at", { ascending: false }),
        ]);

        setMedia((mediaRes.data as unknown as ProductMedia[]) ?? []);
        setFeatures((featuresRes.data as unknown as ProductFeature[]) ?? []);
        setReviews((reviewsRes.data as unknown as ProductReview[]) ?? []);
      }
      setLoading(false);
    };

    fetch();
  }, [slug, supabase]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    setSubmittingReview(true);

    const { data } = await supabase
      .from("product_reviews")
      .insert({
        product_id: product.id,
        author_id: user.id,
        rating: reviewRating,
        title: reviewTitle || null,
        body: reviewBody,
      })
      .select("*, author:profiles(*)")
      .single();

    if (data) {
      setReviews((prev) => [data as unknown as ProductReview, ...prev]);
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
    }
    setSubmittingReview(false);
  };

  if (loading) return <div className="flex items-center justify-center p-8">Loading product...</div>;
  if (!product) return <div className="flex items-center justify-center p-8">Product not found.</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {product.logo_url && (
              <img src={product.logo_url} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.is_verified && <VerifiedBadge />}
              </div>
              {product.tagline && <p className="text-lg text-muted-foreground">{product.tagline}</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {product.website_url && (
            <a href={product.website_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2"><ExternalLink className="h-4 w-4" />Website</Button>
            </a>
          )}
          <HireExpertModal productId={product.id} productName={product.name} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {product.avg_rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{product.avg_rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({product.review_count} reviews)</span>
          </div>
        )}
        {product.autonomy_level && (
          <Badge variant="outline">{product.autonomy_level.replace(/_/g, " ")}</Badge>
        )}
        <Link href={`/community/forums?product=${product.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageSquare className="h-4 w-4" />Ask a Peer
          </Button>
        </Link>
      </div>

      {media.length > 0 && <MediaGallery media={media} />}

      <div className="prose max-w-none">
        <p>{product.description}</p>
      </div>

      {features.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Features</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {features.map((f) => (
                <li key={f.id} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {f.feature_text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>
        {profile?.is_verified && (
          <Card>
            <CardHeader><CardTitle>Write a Review</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submitReview} className="space-y-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setReviewRating(n)}>
                        <Star className={`h-5 w-5 ${n <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewTitle">Title (optional)</Label>
                  <Input id="reviewTitle" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewBody">Review</Label>
                  <Textarea id="reviewBody" value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} rows={3} required />
                </div>
                <Button type="submit" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {reviews.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">No reviews yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
