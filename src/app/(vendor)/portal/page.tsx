"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VendorPortalPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [autonomyLevel, setAutonomyLevel] = useState("");
  const [keywords, setKeywords] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const keywordArray = keywords.split(",").map((k) => k.trim()).filter(Boolean);

    await supabase.from("marketplace_products").insert({
      vendor_id: user.id,
      name,
      slug: `${slug}-${Date.now()}`,
      tagline: tagline || null,
      description,
      website_url: websiteUrl || null,
      autonomy_level: autonomyLevel || null,
      problem_keywords: keywordArray.length > 0 ? keywordArray : null,
    });

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <h1 className="text-3xl font-bold">Product Submitted!</h1>
        <p className="mt-4 text-muted-foreground">
          Your product has been submitted for review. Our team will review it shortly.
        </p>
        <Badge variant="secondary" className="mt-4">Pending Review</Badge>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit Your Product</h1>
        <p className="text-muted-foreground">List your AI tool in the Pawsitive Intelligence marketplace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Fill in your product information for review.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Brief description in one line" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input id="website" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://" />
            </div>
            <div className="space-y-2">
              <Label>Autonomy Level</Label>
              <Select value={autonomyLevel} onValueChange={setAutonomyLevel}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="human_in_the_loop">Human in the Loop</SelectItem>
                  <SelectItem value="semi_autonomous">Semi-Autonomous</SelectItem>
                  <SelectItem value="fully_autonomous">Fully Autonomous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Problem Keywords (comma-separated)</Label>
              <Input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="patient intake, scheduling, inventory" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
