import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, BookOpen, ShoppingBag, Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { count: enrollmentCount } = await supabase
    .from("course_enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const { count: conversationCount } = await supabase
    .from("agent_conversations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening in the Pawsitive Intelligence community.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Community Chat</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Active</p>
            <p className="text-xs text-muted-foreground">Real-time conversations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{enrollmentCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Learning modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Marketplace</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Browse</p>
            <p className="text-xs text-muted-foreground">AI tools & services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{conversationCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">Agent sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into the community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/community/chat" className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Join a Chat Channel</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/community/forums" className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Browse Forums</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/learn" className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Explore Courses</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/marketplace" className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5" />
                <span className="font-medium">Browse AI Tools</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Agents</CardTitle>
            <CardDescription>Get personalized assistance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/agents/engagement">
              <div className="rounded-md border p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Badge>Pawsitive Pulse</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Engagement agent for announcements, polls, and community activity.
                </p>
              </div>
            </Link>
            <Link href="/agents/recommend">
              <div className="rounded-md border p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Pawsitive Advisor</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  AI tool recommendation agent with marketplace knowledge.
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
