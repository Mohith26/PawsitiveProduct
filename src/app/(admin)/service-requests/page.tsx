"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

interface Lead {
  id: string;
  user_name: string;
  company: string;
  problem_description: string;
  budget: string | null;
  status: string;
  created_at: string;
  product: { name: string } | null;
}

export default function ServiceRequestsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("service_leads")
        .select("*, product:marketplace_products(name)")
        .order("created_at", { ascending: false });
      setLeads((data as unknown as Lead[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const updateStatus = async (leadId: string, status: string) => {
    await supabase.from("service_leads").update({ status }).eq("id", leadId);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Service Requests</h1>
      <p className="text-muted-foreground">Track and manage concierge service requests.</p>

      {leads.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No service requests yet.</p>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{lead.user_name} - {lead.company}</CardTitle>
                  <Badge variant={lead.status === "new" ? "default" : "secondary"}>{lead.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.product && (
                  <p className="text-sm"><span className="font-medium">Product:</span> {lead.product.name}</p>
                )}
                <p className="text-sm">{lead.problem_description}</p>
                {lead.budget && <p className="text-sm text-muted-foreground">Budget: {lead.budget}</p>}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </p>
                  <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
