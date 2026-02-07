"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  BookOpen,
  ShoppingBag,
  Bot,
  Sparkles,
  User,
  Shield,
  Store,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/community/chat", icon: MessageSquare },
  { name: "Forums", href: "/community/forums", icon: MessagesSquare },
  { name: "Learn", href: "/learn", icon: BookOpen },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { name: "Engagement Agent", href: "/agents/engagement", icon: Sparkles },
  { name: "AI Advisor", href: "/agents/recommend", icon: Bot },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const isAdmin = profile && ["admin", "super_admin"].includes(profile.role);
  const isVendor =
    profile && ["vendor", "admin", "super_admin"].includes(profile.role);

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-lg font-bold">
          Pawsitive Intelligence
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
        {(isAdmin || isVendor) && <div className="my-3 border-t" />}
        {isAdmin && (
          <Link
            href="/admin/overview"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
        {isVendor && (
          <Link
            href="/vendor/portal"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/vendor")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <Store className="h-4 w-4" />
            Vendor Portal
          </Link>
        )}
      </nav>
    </aside>
  );
}
