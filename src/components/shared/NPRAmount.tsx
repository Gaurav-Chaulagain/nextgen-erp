import React from "react";
import { formatNPR, formatAmountOnly } from "../../lib/utils";
import { Decimal } from "decimal.js";

interface NPRAmountProps {
  amount: Decimal | number;
  className?: string;
  highlightColor?: boolean;
  showSign?: boolean;
  showCurrency?: boolean;
}

export function NPRAmount({ amount, className = "", highlightColor = false, showSign = false, showCurrency = true }: NPRAmountProps) {
  let numericVal = 0;
  if (amount instanceof Decimal) {
    numericVal = amount.toNumber();
  } else if (amount && typeof (amount as any).toNumber === "function") {
    numericVal = (amount as any).toNumber();
  } else {
    numericVal = Number(amount) || 0;
  }

  const formatted = showCurrency ? formatNPR(amount) : formatAmountOnly(amount);
  
  let colorClass = "";
  if (highlightColor) {
    if (numericVal > 0) {
      colorClass = "text-emerald-600 dark:text-emerald-400 font-semibold";
    } else if (numericVal < 0) {
      colorClass = "text-rose-600 dark:text-rose-400 font-semibold";
    }
  }

  const signPrefix = showSign && numericVal > 0 ? "+" : "";

  return (
    <span className={`font-mono tracking-tight ${colorClass} ${className}`}>
      {signPrefix}{formatted}
    </span>
  );
}
export default NPRAmount;
