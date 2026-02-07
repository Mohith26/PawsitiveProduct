"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("other");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    const supabase = createClient();
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company,
          job_title: jobTitle,
          industry_segment: industry,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else if (data.user) {
      // Create profile (trigger also creates it, but this ensures metadata is complete)
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        company,
        job_title: jobTitle,
        industry_segment: industry,
      });
      if (profileError) {
        console.error("Profile creation error:", profileError);
        // The database trigger should have created the profile already,
        // so this failing is not critical. Continue to dashboard.
      }
      window.location.href = "/dashboard";
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join Pawsitive Intelligence</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry Segment</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veterinary">Veterinary</SelectItem>
                  <SelectItem value="cpg">CPG</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Create Account"}
            </Button>
          </form>
          {message && (
            <p className="mt-4 text-center text-sm text-muted-foreground">{message}</p>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
