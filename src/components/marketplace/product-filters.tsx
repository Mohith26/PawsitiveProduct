"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceCategory } from "@/lib/types/marketplace";

interface ProductFiltersProps {
  categories: MarketplaceCategory[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search AI tools..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => updateParam("q", e.target.value)}
        className="w-64"
      />
      <Select
        value={searchParams.get("category") ?? "all"}
        onValueChange={(v) => updateParam("category", v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("autonomy") ?? "all"}
        onValueChange={(v) => updateParam("autonomy", v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Autonomy Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Autonomy</SelectItem>
          <SelectItem value="human_in_the_loop">Human in the Loop</SelectItem>
          <SelectItem value="semi_autonomous">Semi-Autonomous</SelectItem>
          <SelectItem value="fully_autonomous">Fully Autonomous</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
