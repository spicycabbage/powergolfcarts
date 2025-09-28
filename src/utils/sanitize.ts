/**
 * Sanitize HTML content to prevent XSS attacks
 * Server-safe implementation that works in both Node.js and browser environments
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  // Use regex-based sanitization for server-side compatibility
  let cleanHtml = html

  // Remove script tags and their content
  cleanHtml = cleanHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  
  // Remove style tags and their content
  cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  
  // Remove dangerous tags
  cleanHtml = cleanHtml.replace(/<(script|object|embed|form|iframe|frame|frameset|applet|meta|link|base)[^>]*>/gi, '')
  cleanHtml = cleanHtml.replace(/<\/(script|object|embed|form|iframe|frame|frameset|applet|meta|link|base)>/gi, '')
  
  // Remove dangerous attributes
  cleanHtml = cleanHtml.replace(/\s(on\w+|style|formaction|action)\s*=\s*["'][^"']*["']/gi, '')
  cleanHtml = cleanHtml.replace(/\s(on\w+|style|formaction|action)\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: and data: protocols
  cleanHtml = cleanHtml.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
  cleanHtml = cleanHtml.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')
  cleanHtml = cleanHtml.replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"')
  cleanHtml = cleanHtml.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""')
  
  return cleanHtml
}

/**
 * Enhanced input sanitization for form inputs
 * Removes potentially dangerous characters and scripts
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .trim()
    // Remove script tags and their content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove style tags and their content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove dangerous HTML tags
    .replace(/<(script|object|embed|form|iframe|frame|frameset|applet|meta|link)[^>]*>/gi, '')
    // Remove javascript: and data: protocols
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Limit dangerous characters but preserve basic HTML
    .replace(/[<>]/g, (match) => {
      return match === '<' ? '&lt;' : '&gt;'
    })
}

/**
 * Sanitize text content (no HTML allowed)
 * For plain text inputs like names, emails, etc.
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    .trim()
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}
