import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, BookOpen, ShoppingBag, Bot } from "lucide-react";

const pillars = [
  {
    icon: MessageSquare,
    title: "Community",
    description: "Connect with pet industry peers in real-time chat channels and discussion forums.",
  },
  {
    icon: BookOpen,
    title: "Learn",
    description: "Structured AI coursework designed specifically for veterinary, CPG, and retail leaders.",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Discover and evaluate AI tools vetted by your peers, with verified reviews and expert matching.",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description: "Get personalized AI tool recommendations and community engagement powered by Claude.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Pawsitive Intelligence</span>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            AI Intelligence for the
            <br />
            <span className="text-primary">Pet Industry</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            The trusted platform where pet industry executives evaluate AI tools,
            learn from structured coursework, and connect with peers — all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Join the Community</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <Card key={pillar.title}>
                <CardHeader>
                  <pillar.icon className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{pillar.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t bg-muted/50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Built for Pet Industry Leaders</h2>
            <p className="mt-4 text-muted-foreground">
              Veterinary clinics, CPG brands, and retail chains trust Pawsitive Intelligence
              to navigate the AI landscape.
            </p>
            <div className="mt-8 flex justify-center gap-8">
              <div>
                <div className="text-3xl font-bold">Veterinary</div>
                <div className="text-sm text-muted-foreground">Clinics & Networks</div>
              </div>
              <div>
                <div className="text-3xl font-bold">CPG</div>
                <div className="text-sm text-muted-foreground">Brands & Manufacturers</div>
              </div>
              <div>
                <div className="text-3xl font-bold">Retail</div>
                <div className="text-sm text-muted-foreground">Stores & E-commerce</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Pawsitive Intelligence. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
