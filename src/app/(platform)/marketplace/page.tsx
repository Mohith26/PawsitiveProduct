import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/marketplace/product-card";
import { ProductFilters } from "@/components/marketplace/product-filters";
import type { MarketplaceProduct, MarketplaceCategory } from "@/lib/types/marketplace";

interface Props {
  searchParams: Promise<{ q?: string; category?: string; autonomy?: string }>;
}

export default async function MarketplacePage({ searchParams }: Props) {
  const { q, category, autonomy } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("marketplace_categories")
    .select("*, subcategories:marketplace_subcategories(*)")
    .order("display_order", { ascending: true });

  let query = supabase
    .from("marketplace_products")
    .select("*, vendor:profiles(*), subcategory:marketplace_subcategories(*, category:marketplace_categories(*))")
    .eq("status", "approved")
    .order("is_verified", { ascending: false })
    .order("avg_rating", { ascending: false });

  if (q) {
    query = query.textSearch("search_vector", q);
  }

  if (autonomy) {
    query = query.eq("autonomy_level", autonomy);
  }

  const { data: products } = await query;

  let filteredProducts = products as unknown as MarketplaceProduct[] ?? [];
  if (category && categories) {
    const cat = categories.find((c) => c.slug === category);
    if (cat) {
      const subIds = (cat.subcategories ?? []).map((s: { id: string }) => s.id);
      filteredProducts = filteredProducts.filter((p) => p.subcategory_id && subIds.includes(p.subcategory_id));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Marketplace</h1>
        <p className="text-muted-foreground">Discover AI tools vetted by pet industry peers</p>
      </div>

      <ProductFilters categories={(categories as unknown as MarketplaceCategory[]) ?? []} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {filteredProducts.length === 0 && (
          <p className="col-span-3 py-8 text-center text-muted-foreground">
            No products found. Try adjusting your filters.
          </p>
        )}
      </div>
    </div>
  );
}
