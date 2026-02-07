import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { VerifiedBadge } from "./verified-badge";
import type { MarketplaceProduct } from "@/lib/types/marketplace";

interface ProductCardProps {
  product: MarketplaceProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/marketplace/${product.slug}`}>
      <Card className="h-full transition-colors hover:bg-accent/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {product.logo_url && (
                <img src={product.logo_url} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  {product.is_verified && <VerifiedBadge />}
                </div>
                {product.tagline && <CardDescription className="mt-1">{product.tagline}</CardDescription>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="mt-3 flex items-center gap-3">
            {product.avg_rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{product.avg_rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({product.review_count})</span>
              </div>
            )}
            {product.autonomy_level && (
              <Badge variant="outline" className="text-xs">
                {product.autonomy_level.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
          {product.problem_keywords && product.problem_keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.problem_keywords.slice(0, 3).map((kw) => (
                <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
