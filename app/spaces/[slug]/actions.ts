"use server";

import { redirect } from "next/navigation";
import { createLeadFromPublicSlug } from "@/lib/publish";

function redirectWithMessage(slug: string, message: string) {
  redirect(`/spaces/${slug}?message=${encodeURIComponent(message)}`);
}

export async function submitPublicLeadAction(slug: string, formData: FormData) {
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!contactName || !contactEmail || !message) {
    redirectWithMessage(slug, "Name, email, and message are required.");
  }

  try {
    await createLeadFromPublicSlug({
      slug,
      contactName,
      contactEmail,
      contactPhone,
      message
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "We could not submit your inquiry.";
    redirectWithMessage(slug, errorMessage);
  }

  redirectWithMessage(slug, "Your inquiry was submitted.");
}
