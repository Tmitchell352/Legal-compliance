// Hand-written types mirroring supabase/migrations/0001_init.sql.
// If you connect a real Supabase project, you can replace this file with
// generated types via `supabase gen types typescript`.

export type SubscriptionTier = "free" | "pro" | "portfolio";
export type SubscriptionStatus = "none" | "trialing" | "active" | "past_due" | "canceled";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_tier: SubscriptionTier;
  created_at: string;
}

export interface Jurisdiction {
  id: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  permit_required: boolean;
  permit_name: string | null;
  permit_authority: string | null;
  permit_renewal_months: number;
  permit_url: string | null;
  tax_name: string | null;
  tax_filing_frequency: "monthly" | "quarterly" | "semi_annual" | "annual" | null;
  tax_authority: string | null;
  tax_url: string | null;
  occupancy_notes: string | null;
  insurance_notes: string | null;
  other_requirements: string | null;
  last_verified_on: string;
  created_at: string;
}

export interface Property {
  id: string;
  user_id: string;
  jurisdiction_id: string | null;
  nickname: string;
  address_line: string | null;
  city: string;
  state: string;
  permit_number: string | null;
  permit_issued_on: string | null;
  permit_expires_on: string | null;
  last_tax_filed_on: string | null;
  created_at: string;
}

export type DeadlineKind = "permit_renewal" | "tax_filing" | "insurance_renewal" | "custom";
export type DeadlineStatus = "upcoming" | "completed" | "overdue" | "dismissed";

export interface ComplianceDeadline {
  id: string;
  property_id: string;
  kind: DeadlineKind;
  title: string;
  due_date: string;
  status: DeadlineStatus;
  notes: string | null;
  reminder_stage: number;
  reminder_sent_at: string | null;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  property_id: string;
  name: string;
  storage_path: string;
  uploaded_at: string;
}

export const TIER_LIMITS: Record<SubscriptionTier, { properties: number; label: string; priceMonthly: number }> = {
  free: { properties: 1, label: "Free", priceMonthly: 0 },
  pro: { properties: 5, label: "Pro", priceMonthly: 15 },
  portfolio: { properties: 25, label: "Portfolio", priceMonthly: 39 },
};
