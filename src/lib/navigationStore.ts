import { connectToDatabase } from '@/lib/mongodb'
import Navigation, { INavigationConfig } from '@/lib/models/Navigation'

// Module-level cache for navigation (per server instance)
let cachedNavigation: INavigationConfig | null = null

function sanitizeNavigation(doc: any | null): INavigationConfig {
  if (!doc) return { ...defaultNavigation }
  const nav: INavigationConfig = {
    header: {
      logo: {
        text: doc.header?.logo?.text || defaultNavigation.header.logo.text,
        href: doc.header?.logo?.href || defaultNavigation.header.logo.href,
        image: doc.header?.logo?.image || '',
        useImage: !!doc.header?.logo?.useImage,
      },
      banner: {
        text: doc.header?.banner?.text || defaultNavigation.header.banner.text,
        isActive: doc.header?.banner?.isActive ?? defaultNavigation.header.banner.isActive,
      },
    },
    secondaryNav: Array.isArray(doc.secondaryNav) ? doc.secondaryNav : [],
    primaryNav: Array.isArray(doc.primaryNav) ? doc.primaryNav : [],
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
  }
  // Ensure no ObjectId or Mongoose document instances are present
  return JSON.parse(JSON.stringify(nav)) as INavigationConfig
}

export const defaultNavigation: INavigationConfig = {
  header: {
    logo: {
      text: 'E-Commerce',
      href: '/',
      image: '',
      useImage: false,
    },
    banner: {
      text: 'Free shipping on orders over $50! Use code FREESHIP',
      isActive: true,
    },
  },
  secondaryNav: [
    { name: 'About Us', href: '/about', isActive: true },
    { name: 'FAQ', href: '/faq', isActive: true },
    { name: 'Blog', href: '/blog', isActive: true },
    { name: 'Contact Us', href: '/contact', isActive: true },
  ],
  primaryNav: [],
  updatedAt: new Date(),
}

export async function getNavigationConfig(): Promise<INavigationConfig> {
  if (cachedNavigation) return cachedNavigation

  // During production build, avoid DB entirely for speed/clean builds
  if (process.env.SKIP_DB_AT_BUILD === '1') {
    cachedNavigation = { ...defaultNavigation }
    return cachedNavigation
  }

  try {
    await connectToDatabase()
    const doc = await Navigation.findOne().lean<any>().exec()
    cachedNavigation = sanitizeNavigation(doc)
  } catch (err) {
    cachedNavigation = { ...defaultNavigation }
  }
  return cachedNavigation
}

export function setNavigationConfig(config: INavigationConfig | any) {
  cachedNavigation = sanitizeNavigation(config)
}

export function clearNavigationConfig() {
  cachedNavigation = null
}


