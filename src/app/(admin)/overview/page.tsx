import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: productCount },
    { count: pendingProducts },
    { count: courseCount },
    { count: leadCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("marketplace_products").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("marketplace_products").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("service_leads").select("*", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{userCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{productCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingProducts ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{courseCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/vendors"><Button variant="outline" className="w-full justify-start">Vendor Approvals ({pendingProducts ?? 0} pending)</Button></Link>
            <Link href="/admin/service-requests"><Button variant="outline" className="w-full justify-start">Service Requests ({leadCount ?? 0} new)</Button></Link>
            <Link href="/admin/courses"><Button variant="outline" className="w-full justify-start">Manage Courses</Button></Link>
            <Link href="/admin/agents"><Button variant="outline" className="w-full justify-start">Agent Configuration</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
