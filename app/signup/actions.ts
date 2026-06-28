"use server";

import { redirect } from "next/navigation";
import { env, hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function messageUrl(message: string) {
  return `/signup?message=${encodeURIComponent(message)}`;
}

export async function signUpAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect(messageUrl("Add Supabase environment variables before using auth."));
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(messageUrl("Email and password are required."));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(messageUrl("Supabase client could not be created."));
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.appUrl}/auth/callback`
    }
  });

  if (error) {
    redirect(messageUrl(error.message));
  }

  redirect(messageUrl("Check your email to confirm your account, then sign in."));
}

export async function signInAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect(messageUrl("Add Supabase environment variables before using auth."));
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(messageUrl("Email and password are required."));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(messageUrl("Supabase client could not be created."));
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(messageUrl(error.message));
  }

  redirect("/onboarding");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
