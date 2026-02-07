"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  BookOpen,
  ShoppingBag,
  Bot,
  Sparkles,
  User,
  Menu,
  Shield,
  Store,
} from "lucide-react";
import { useState } from "react";

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

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();

  const isAdmin = profile && ["admin", "super_admin"].includes(profile.role);
  const isVendor =
    profile && ["vendor", "admin", "super_admin"].includes(profile.role);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-bold">Pawsitive Intelligence</span>
        </div>
        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50"
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
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          {isVendor && (
            <Link
              href="/vendor/portal"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/vendor")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <Store className="h-4 w-4" />
              Vendor Portal
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
