// In-memory OTP store — replace with Redis in production
export const codeStore = new Map<string, { code: string; expires: number }>()
