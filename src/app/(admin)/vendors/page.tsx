"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface PendingProduct {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  website_url: string | null;
  status: string;
  created_at: string;
  vendor: { full_name: string | null; company: string | null; email: string } | null;
}

export default function VendorApprovalsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("marketplace_products")
        .select("*, vendor:profiles(*)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      setProducts((data as unknown as PendingProduct[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const handleApprove = async (productId: string) => {
    await supabase
      .from("marketplace_products")
      .update({ status: "approved" })
      .eq("id", productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleReject = async (productId: string) => {
    await supabase
      .from("marketplace_products")
      .update({ status: "rejected", rejection_reason: rejectionReasons[productId] || null })
      .eq("id", productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vendor Approvals</h1>
      <p className="text-muted-foreground">Review and approve product submissions from vendors.</p>

      {products.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No pending approvals.</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.tagline}</p>
                  </div>
                  <Badge>Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{product.description}</p>
                <div className="text-sm text-muted-foreground">
                  <p>Vendor: {product.vendor?.full_name} ({product.vendor?.company})</p>
                  {product.website_url && (
                    <a href={product.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary">
                      <ExternalLink className="h-3 w-3" />{product.website_url}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Rejection reason (optional)"
                    value={rejectionReasons[product.id] ?? ""}
                    onChange={(e) => setRejectionReasons((prev) => ({ ...prev, [product.id]: e.target.value }))}
                    className="flex-1"
                  />
                  <Button onClick={() => handleApprove(product.id)} className="gap-1">
                    <CheckCircle className="h-4 w-4" />Approve
                  </Button>
                  <Button variant="destructive" onClick={() => handleReject(product.id)} className="gap-1">
                    <XCircle className="h-4 w-4" />Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
