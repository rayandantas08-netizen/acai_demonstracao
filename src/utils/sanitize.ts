// Security and validation utility functions for Açaí Supremo Ouro

/**
 * Sanitizes user input to prevent XSS (Cross-Site Scripting) and code injection.
 * Strips HTML tags, script attempts, and dangerous attributes before rendering or encoding.
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      };
      return map[char] || char;
    })
    .trim();
}

/**
 * Sanitizes input specifically for plain text WhatsApp messaging (keeps punctuation and accents intact, removes script/HTML tags)
 */
export function sanitizeForWhatsApp(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Validates Brazilian phone numbers (landline or mobile: 10 to 11 digits)
 */
export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

/**
 * Formats a raw phone string into (XX) 9XXXX-XXXX format
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Formats currency in Brazilian Real (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Rate Limiter against Spam
const lastSubmitTimes: Map<string, number> = new Map();

export function checkRateLimit(key: string, cooldownMs: number = 8000): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const lastTime = lastSubmitTimes.get(key) || 0;
  const diff = now - lastTime;

  if (diff < cooldownMs) {
    const waitSeconds = Math.ceil((cooldownMs - diff) / 1000);
    return { allowed: false, waitSeconds };
  }

  lastSubmitTimes.set(key, now);
  return { allowed: true };
}
