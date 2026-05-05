import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateSentimentPercentage(score: number): number {
  if (score < 0) {
    // Old format: -1 to 1. E.g., -1 -> 0%, 0 -> 50%
    return Math.round((score + 1) * 50);
  } else if (score <= 1) {
    // Ambiguous range (could be old 0->1 or new 0->1).
    // Let's assume the new format (0-2) where 1 is 50%, 0 is 0%.
    // If it was the old format, it will be slightly skewed but safely 0-50%.
    return Math.round((score / 2) * 100);
  } else if (score <= 2) {
    // New format: 1 to 2. E.g., 2 -> 100%, 1.5 -> 75%
    return Math.round((score / 2) * 100);
  } else {
    // Fallback bounds
    return Math.round(Math.max(0, Math.min(100, score)));
  }
}
