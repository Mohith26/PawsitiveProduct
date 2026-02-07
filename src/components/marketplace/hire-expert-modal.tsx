"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Handshake } from "lucide-react";

interface HireExpertModalProps {
  productId: string;
  productName: string;
}

export function HireExpertModal({ productId, productName }: HireExpertModalProps) {
  const { profile } = useAuth();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState(profile?.full_name ?? "");
  const [company, setCompany] = useState(profile?.company ?? "");
  const [problem, setProblem] = useState("");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await supabase.from("service_leads").insert({
      product_id: productId,
      user_id: profile?.id,
      user_name: userName,
      company,
      problem_description: problem,
      budget: budget || null,
    });

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Handshake className="h-4 w-4" />Hire an Expert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hire an Expert for {productName}</DialogTitle>
          <DialogDescription>
            Submit your needs and we&apos;ll match you with a vetted implementation expert.
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-lg font-medium">Request Submitted!</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Our concierge team will be in touch shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="problem">What do you need help with?</Label>
              <Textarea id="problem" value={problem} onChange={(e) => setProblem(e.target.value)} required rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Range (optional)</Label>
              <Input id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. $5,000 - $10,000" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
