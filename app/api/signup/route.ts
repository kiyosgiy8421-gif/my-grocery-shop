import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo: APP_URL,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const confirmationLink = data.properties?.action_link;
    if (!confirmationLink) {
      return NextResponse.json(
        { error: "Failed to generate confirmation link" },
        { status: 500 }
      );
    }

    const baseUrl = new URL(request.url).origin;
    const resendResponse = await fetch(`${baseUrl}/api/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, confirmationLink }),
    });

    if (!resendResponse.ok) {
      const errData = await resendResponse.json().catch(() => ({}));
      console.error("Send confirmation failed:", errData);
      return NextResponse.json(
        { error: "Account created but failed to send confirmation email. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup failed:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
