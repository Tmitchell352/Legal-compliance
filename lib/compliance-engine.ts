import { addMonths, addQuarters, addYears, differenceInCalendarDays, isBefore, startOfDay } from "date-fns";

export type TaxFilingFrequency = "monthly" | "quarterly" | "semi_annual" | "annual";

export type DeadlineKind = "permit_renewal" | "tax_filing" | "insurance_renewal" | "custom";

export interface GeneratedDeadline {
  kind: DeadlineKind;
  title: string;
  dueDate: Date;
}

export interface JurisdictionRules {
  permitRequired: boolean;
  permitName: string | null;
  permitRenewalMonths: number;
  taxName: string | null;
  taxFilingFrequency: TaxFilingFrequency | null;
}

export interface PropertyComplianceInputs {
  permitIssuedOn: Date | null;
  permitExpiresOn: Date | null;
  lastTaxFiledOn: Date | null;
  today?: Date;
}

/**
 * Advances a filing date forward by one period for a given tax frequency.
 */
function stepTaxPeriod(date: Date, frequency: TaxFilingFrequency): Date {
  switch (frequency) {
    case "monthly":
      return addMonths(date, 1);
    case "quarterly":
      return addQuarters(date, 1);
    case "semi_annual":
      return addMonths(date, 6);
    case "annual":
      return addYears(date, 1);
  }
}

/**
 * Given a starting reference date and a filing frequency, walks forward to the
 * next period boundary that is still in the future (so a stale last-filed date
 * doesn't produce a deadline that's already overdue by multiple periods).
 */
function nextOccurrence(from: Date, frequency: TaxFilingFrequency, today: Date): Date {
  let next = stepTaxPeriod(from, frequency);
  // guard against runaway loops if `from` is far in the past
  let iterations = 0;
  while (isBefore(next, today) && iterations < 240) {
    next = stepTaxPeriod(next, frequency);
    iterations += 1;
  }
  return next;
}

/**
 * Computes the set of upcoming compliance deadlines for a property, given its
 * jurisdiction's rules. This is pure and DB-agnostic — callers persist the
 * result into `compliance_deadlines`.
 */
export function generateDeadlines(
  rules: JurisdictionRules,
  inputs: PropertyComplianceInputs
): GeneratedDeadline[] {
  const today = startOfDay(inputs.today ?? new Date());
  const deadlines: GeneratedDeadline[] = [];

  if (rules.permitRequired) {
    const permitLabel = rules.permitName ?? "Permit renewal";
    if (inputs.permitExpiresOn) {
      let dueDate = startOfDay(inputs.permitExpiresOn);
      // if the recorded expiry has already passed, roll forward by the
      // renewal cadence so we always surface the *next* actionable deadline
      while (isBefore(dueDate, today)) {
        dueDate = addMonths(dueDate, rules.permitRenewalMonths);
      }
      deadlines.push({ kind: "permit_renewal", title: permitLabel, dueDate });
    } else if (inputs.permitIssuedOn) {
      const dueDate = nextOccurrenceByMonths(startOfDay(inputs.permitIssuedOn), rules.permitRenewalMonths, today);
      deadlines.push({ kind: "permit_renewal", title: permitLabel, dueDate });
    }
    // if neither date is known, we can't compute a deadline yet — the UI
    // should prompt the host to record their permit issue/expiry date.
  }

  if (rules.taxFilingFrequency) {
    const taxLabel = rules.taxName ?? "Tax filing";
    const base = inputs.lastTaxFiledOn ? startOfDay(inputs.lastTaxFiledOn) : today;
    const dueDate = nextOccurrence(base, rules.taxFilingFrequency, today);
    deadlines.push({ kind: "tax_filing", title: taxLabel, dueDate });
  }

  return deadlines;
}

function nextOccurrenceByMonths(from: Date, months: number, today: Date): Date {
  let next = addMonths(from, months);
  let iterations = 0;
  while (isBefore(next, today) && iterations < 240) {
    next = addMonths(next, months);
    iterations += 1;
  }
  return next;
}

export type UrgencyLevel = "overdue" | "urgent" | "soon" | "later";

/**
 * Classifies a due date into a UI urgency bucket:
 * overdue (past), urgent (<=14 days), soon (<=45 days), later (everything else).
 */
export function urgencyOf(dueDate: Date, today: Date = new Date()): UrgencyLevel {
  const days = differenceInCalendarDays(startOfDay(dueDate), startOfDay(today));
  if (days < 0) return "overdue";
  if (days <= 14) return "urgent";
  if (days <= 45) return "soon";
  return "later";
}

export const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  overdue: "Overdue",
  urgent: "Due soon",
  soon: "Coming up",
  later: "On track",
};
