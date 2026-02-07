import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        const metadata = data.user.user_metadata;
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: metadata?.full_name || metadata?.name || null,
          avatar_url: metadata?.avatar_url || metadata?.picture || null,
          company: metadata?.company || null,
          job_title: metadata?.job_title || null,
          industry_segment: metadata?.industry_segment || "other",
        });
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
