"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markDeadlineComplete(formData: FormData) {
  const deadlineId = String(formData.get("deadline_id"));
  const propertyId = String(formData.get("property_id"));

  const supabase = await createClient();
  await supabase.from("compliance_deadlines").update({ status: "completed" }).eq("id", deadlineId);

  revalidatePath(`/dashboard/properties/${propertyId}`);
}

export async function deleteProperty(formData: FormData) {
  const propertyId = String(formData.get("property_id"));

  const supabase = await createClient();
  await supabase.from("properties").delete().eq("id", propertyId);

  redirect("/dashboard");
}
