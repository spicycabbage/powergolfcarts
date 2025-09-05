import { z } from 'zod'

// Site configuration schema
export const SiteConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  database: z.string(),
  theme: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
  }),
  features: z.object({
    blog: z.boolean().default(false),
    reviews: z.boolean().default(true),
    wishlist: z.boolean().default(true),
    multiCurrency: z.boolean().default(false),
    multiLanguage: z.boolean().default(false),
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
  }),
  payment: z.object({
    stripe: z.object({
      publishableKey: z.string(),
      secretKey: z.string(),
    }),
    paypal: z.object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
    }).optional(),
  }),
  email: z.object({
    smtp: z.object({
      host: z.string(),
      port: z.number(),
      secure: z.boolean(),
      auth: z.object({
        user: z.string(),
        pass: z.string(),
      }),
    }),
    from: z.string(),
  }),
  analytics: z.object({
    googleAnalyticsId: z.string().optional(),
    facebookPixelId: z.string().optional(),
  }).optional(),
})

export type SiteConfig = z.infer<typeof SiteConfigSchema>

// Environment-based configuration
export const getSiteConfig = (): SiteConfig => {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || 'default'

  // Load site-specific configuration
  const configPath = `./sites/${siteId}/config.json`

  try {
    // In production, this would load from a database or CDN
    const config = require(configPath)
    return SiteConfigSchema.parse(config)
  } catch (error) {
    // Fallback to environment variables
    return SiteConfigSchema.parse({
      id: siteId,
      name: process.env.NEXT_PUBLIC_SITE_NAME || 'My Store',
      domain: process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000',
      database: process.env.MONGODB_DB || 'ecommerce',
      theme: {
        primary: process.env.THEME_PRIMARY || '#3B82F6',
        secondary: process.env.THEME_SECONDARY || '#64748B',
        accent: process.env.THEME_ACCENT || '#F59E0B',
        background: process.env.THEME_BACKGROUND || '#FFFFFF',
        text: process.env.THEME_TEXT || '#1F2937',
      },
      features: {
        blog: process.env.FEATURE_BLOG === 'true',
        reviews: process.env.FEATURE_REVIEWS !== 'false',
        wishlist: process.env.FEATURE_WISHLIST !== 'false',
        multiCurrency: process.env.FEATURE_MULTI_CURRENCY === 'true',
        multiLanguage: process.env.FEATURE_MULTI_LANGUAGE === 'true',
      },
      seo: {
        title: process.env.SEO_TITLE || 'My Ecommerce Store',
        description: process.env.SEO_DESCRIPTION || 'Shop the best products online',
        keywords: (process.env.SEO_KEYWORDS || 'shopping,store,products').split(','),
      },
      payment: {
        stripe: {
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
          secretKey: process.env.STRIPE_SECRET_KEY || '',
        },
      },
      email: {
        smtp: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
          },
        },
        from: process.env.SMTP_FROM || 'noreply@mystore.com',
      },
    })
  }
}

// Database connection based on site
export const getDatabaseName = (siteId?: string): string => {
  const config = getSiteConfig()
  return siteId ? `${config.database}_${siteId}` : config.database
}

// Multi-tenant database connection
export const getTenantConnection = (siteId: string) => {
  const dbName = getDatabaseName(siteId)
  // This would connect to a specific database for the tenant
  return dbName
}




