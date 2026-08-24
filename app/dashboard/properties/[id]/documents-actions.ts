"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DocumentRow } from "@/types/database";

const BUCKET = "property-documents";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

export async function uploadDocument(formData: FormData) {
  const propertyId = String(formData.get("property_id") ?? "");
  const file = formData.get("file");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/dashboard/properties/${propertyId}?doc_error=${encodeURIComponent("Choose a file first")}`);
  }
  if (file.size > MAX_FILE_BYTES) {
    redirect(`/dashboard/properties/${propertyId}?doc_error=${encodeURIComponent("File must be under 10MB")}`);
  }

  // RLS on `properties` scopes this select to rows the caller owns, so a
  // missing result here means either the property doesn't exist or isn't
  // theirs — both should fail the same way.
  const { data: property } = await supabase.from("properties").select("id").eq("id", propertyId).single();
  if (!property) {
    redirect("/dashboard");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.id}/${propertyId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
  });

  if (uploadError) {
    redirect(`/dashboard/properties/${propertyId}?doc_error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error: insertError } = await supabase.from("documents").insert({
    property_id: propertyId,
    name: file.name,
    storage_path: storagePath,
  });

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    redirect(`/dashboard/properties/${propertyId}?doc_error=${encodeURIComponent(insertError.message)}`);
  }

  revalidatePath(`/dashboard/properties/${propertyId}`);
}

export async function deleteDocument(formData: FormData) {
  const documentId = String(formData.get("document_id") ?? "");
  const propertyId = String(formData.get("property_id") ?? "");

  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single<DocumentRow>();

  if (doc) {
    await supabase.storage.from(BUCKET).remove([doc.storage_path]);
    await supabase.from("documents").delete().eq("id", documentId);
  }

  revalidatePath(`/dashboard/properties/${propertyId}`);
}
