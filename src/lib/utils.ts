import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// 为防止 XSS，将字符串进行 HTML 转义
export function escapeHTML(input: string): string {
  if (typeof input !== 'string') return String(input)
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
}

// 解析形如 YYYYMMDDHHmmss 的紧凑时间字符串
export function parseCompactDateTime(ts: string): Date | null {
  if (!ts || typeof ts !== 'string') return null
  const m = ts.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (!m) return null
  const [, y, mo, d, h, mi, s] = m
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s))
  return isNaN(date.getTime()) ? null : date
}

// 将紧凑时间或 Date 转为本地化字符串
export function formatDateTimeLocale(input: string | Date, locale: string = 'zh-CN', options?: Intl.DateTimeFormatOptions): string {
  let date: Date | null = null
  if (input instanceof Date) {
    date = input
  } else {
    date = parseCompactDateTime(input) || new Date(input)
  }
  if (!date || isNaN(date.getTime())) return '未知'
  return date.toLocaleString(locale, options)
}
