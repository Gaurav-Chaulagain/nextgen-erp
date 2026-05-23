import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Decimal } from "decimal.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number using the Indian/Nepali numbering system (2,2,3 layout)
 * e.g., 142500 -> 1,42,500
 */
export function formatNepaliNumber(n: number): string {
  const parts = n.toString().split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1] ? "." + parts[1] : "";

  if (integerPart.length <= 3) {
    return integerPart + decimalPart;
  }

  const lastThree = integerPart.substring(integerPart.length - 3);
  const remaining = integerPart.substring(0, integerPart.length - 3);

  // Comma formatting for every two digits after the last three digits
  const remainingFormatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return remainingFormatted + "," + lastThree + decimalPart;
}

/**
 * Formats financial amounts into NPR format
 * e.g., 142500.5 -> NPR 1,42,500.50
 */
export function formatNPR(amount: Decimal | number): string {
  let val: number;
  if (amount instanceof Decimal) {
    val = amount.toNumber();
  } else if (amount && typeof (amount as any).toNumber === "function") {
    val = (amount as any).toNumber();
  } else {
    val = Number(amount) || 0;
  }

  const fixedVal = val.toFixed(2);
  const parts = fixedVal.split(".");
  const integerFormatted = formatNepaliNumber(Number(parts[0]));
  
  // Keep decimals formatted as .XX
  return `NPR ${integerFormatted}.${parts[1]}`;
}

/**
 * Generate Next Invoice Number
 * e.g. prefix = "INV", lastNumber = 5 -> "INV-0006"
 */
export function generateInvoiceNumber(prefix: string, lastNumber: number): string {
  const nextNumber = lastNumber + 1;
  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

/**
 * Generate Next Purchase Order Number
 * e.g. lastNumber = 12 -> "PO-0013"
 */
export function generatePONumber(lastNumber: number): string {
  const nextNumber = lastNumber + 1;
  return `PO-${String(nextNumber).padStart(4, "0")}`;
}

/**
 * General helper to generate prefixed items codes (e.g. ITM-001, SUP-012)
 */
export function generateCode(prefix: string, lastNumber: number): string {
  const nextNumber = lastNumber + 1;
  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
}

/**
 * Formats a date into a clean text representation
 * e.g., Date -> "May 7, 2026"
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calculates current Nepali Fiscal Year boundaries in AD Gregorian calendar
 * Mid-July (July 16) to Mid-July (July 15) of the following year
 */
export function getFinancialYear(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  let startYearAD: number;
  let endYearAD: number;
  
  // Fiscal year boundary is July 16
  const boundaryDate = new Date(currentYear, 6, 16); // 6 is July (0-indexed)
  
  if (now < boundaryDate) {
    startYearAD = currentYear - 1;
    endYearAD = currentYear;
  } else {
    startYearAD = currentYear;
    endYearAD = currentYear + 1;
  }
  
  const start = new Date(startYearAD, 6, 16, 0, 0, 0, 0); // July 16
  const end = new Date(endYearAD, 6, 15, 23, 59, 59, 999); // July 15 next year
  
  // BS offset: July 16, 2025 corresponds to Shrawan 1, 2082. Label is "2082-83"
  const startYearBS = startYearAD + 57;
  const endYearBS = endYearAD + 57;
  const label = `${startYearBS}-${String(endYearBS).substring(2)}`;
  
  return { start, end, label };
}
