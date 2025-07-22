import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function safeAtob(str: string) {
  try {
    const cleaned = str.replace(/[^A-Za-z0-9+/=]/g, '');
    return atob(cleaned);
  } catch (error) {
    console.error('Invalid Base64 string:', error);
    return null;
  }
}

function isValidBase64(str: string) {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(str) && str.length % 4 === 0;
}