import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  FileText,
  Bot,
  ArrowLeft,
} from "lucide-react";

const adminNav = [
  { name: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { name: "Vendor Approvals", href: "/admin/vendors", icon: ShoppingBag },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Service Requests", href: "/admin/service-requests", icon: FileText },
  { name: "Agent Config", href: "/admin/agents", icon: Bot },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 shrink-0 border-r bg-sidebar">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin/overview" className="text-lg font-bold">
            Admin Panel
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {adminNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
          <div className="my-4 border-t" />
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Platform
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
