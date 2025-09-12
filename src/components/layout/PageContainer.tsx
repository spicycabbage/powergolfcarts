import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl'
  padding?: boolean
}

export function PageContainer({ 
  children, 
  className = '', 
  maxWidth = '7xl',
  padding = true 
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '7xl': 'max-w-7xl'
  }

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : ''

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses} ${className}`}>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function PageHeader({ title, subtitle, className = '' }: PageHeaderProps) {
  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <PageContainer className="py-3">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-700 mt-0.5">{subtitle}</p>}
      </PageContainer>
    </header>
  )
}

interface ContentSectionProps {
  children: ReactNode
  className?: string
  background?: 'white' | 'gray' | 'transparent'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl'
}

export function ContentSection({ 
  children, 
  className = '', 
  background = 'transparent',
  maxWidth = '7xl'
}: ContentSectionProps) {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50', 
    transparent: ''
  }

  return (
    <section className={`${backgroundClasses[background]} ${className}`}>
      <PageContainer maxWidth={maxWidth}>
        {children}
      </PageContainer>
    </section>
  )
}
