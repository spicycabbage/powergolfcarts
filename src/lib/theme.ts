import { getSiteConfig } from './config'

// Generate CSS custom properties from site config
export const generateThemeCSS = () => {
  const config = getSiteConfig()

  return `
    :root {
      --color-primary: ${config.theme.primary};
      --color-secondary: ${config.theme.secondary};
      --color-accent: ${config.theme.accent};
      --color-background: ${config.theme.background};
      --color-text: ${config.theme.text};
      --color-text-light: #6B7280;
      --color-border: #E5E7EB;
      --color-hover: #F9FAFB;
    }

    /* Site-specific styles */
    .site-${config.id} {
      --site-primary: ${config.theme.primary};
      --site-secondary: ${config.theme.secondary};
      --site-accent: ${config.theme.accent};
    }
  `
}

// Theme utilities for components
export const themeUtils = {
  // Get theme colors for Tailwind classes
  getThemeColors: () => {
    const config = getSiteConfig()
    return {
      primary: config.theme.primary,
      secondary: config.theme.secondary,
      accent: config.theme.accent,
      background: config.theme.background,
      text: config.theme.text,
    }
  },

  // Generate button styles based on theme
  getButtonStyles: (variant: 'primary' | 'secondary' | 'accent' = 'primary') => {
    const config = getSiteConfig()
    const colors = {
      primary: config.theme.primary,
      secondary: config.theme.secondary,
      accent: config.theme.accent,
    }

    return {
      backgroundColor: colors[variant],
      borderColor: colors[variant],
      color: variant === 'primary' ? '#FFFFFF' : config.theme.text,
    }
  },

  // Get site-specific CSS class
  getSiteClass: () => {
    const config = getSiteConfig()
    return `site-${config.id}`
  }
}

// Dynamic theme injection
export const injectTheme = () => {
  if (typeof document !== 'undefined') {
    const themeCSS = generateThemeCSS()
    const styleId = 'site-theme-styles'

    let styleElement = document.getElementById(styleId)
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = themeCSS
  }
}



