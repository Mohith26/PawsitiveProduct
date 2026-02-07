"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  tagline: string | null;
  status: string;
  created_at: string;
}

export default function VendorPortalPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [autonomyLevel, setAutonomyLevel] = useState("");
  const [keywords, setKeywords] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: cats } = await supabase
        .from("marketplace_categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (cats) setCategories(cats);

      const { data: subs } = await supabase
        .from("marketplace_subcategories")
        .select("*")
        .order("display_order", { ascending: true });
      if (subs) setSubcategories(subs);
    };
    fetchData();
  }, [supabase]);

  useEffect(() => {
    if (!user) return;
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("marketplace_products")
        .select("id, name, tagline, status, created_at")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setMyProducts(data);
    };
    fetchProducts();
  }, [user, supabase]);

  const filteredSubcategories = subcategories.filter(
    (s) => s.category_id === selectedCategoryId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSuccessMessage("");

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const keywordArray = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const { data } = await supabase
      .from("marketplace_products")
      .insert({
        vendor_id: user.id,
        name,
        slug: `${slug}-${Date.now()}`,
        tagline: tagline || null,
        description,
        website_url: websiteUrl || null,
        autonomy_level: autonomyLevel || null,
        subcategory_id: subcategoryId || null,
        problem_keywords: keywordArray.length > 0 ? keywordArray : null,
      })
      .select("id, name, tagline, status, created_at")
      .single();

    if (data) {
      setMyProducts((prev) => [data, ...prev]);
    }

    setName("");
    setTagline("");
    setDescription("");
    setWebsiteUrl("");
    setAutonomyLevel("");
    setKeywords("");
    setSelectedCategoryId("");
    setSubcategoryId("");
    setSuccessMessage("Product submitted for review!");
    setSubmitting(false);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit Your Product</h1>
        <p className="text-muted-foreground">
          List your AI tool in the Pawsitive Intelligence marketplace.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Fill in your product information for review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Brief description in one line"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={(v) => {
                    setSelectedCategoryId(v);
                    setSubcategoryId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select
                  value={subcategoryId}
                  onValueChange={setSubcategoryId}
                  disabled={!selectedCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Autonomy Level</Label>
              <Select value={autonomyLevel} onValueChange={setAutonomyLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="human_in_the_loop">
                    Human in the Loop
                  </SelectItem>
                  <SelectItem value="semi_autonomous">
                    Semi-Autonomous
                  </SelectItem>
                  <SelectItem value="fully_autonomous">
                    Fully Autonomous
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">
                Problem Keywords (comma-separated)
              </Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="patient intake, scheduling, inventory"
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Submitted Products</CardTitle>
          <CardDescription>
            Track the status of your submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No products submitted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {myProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    {product.tagline && (
                      <p className="text-sm text-muted-foreground">
                        {product.tagline}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      product.status === "approved"
                        ? "default"
                        : product.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {product.status ?? "pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
