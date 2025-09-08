import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin - E-Commerce Store',
    default: 'Admin - E-Commerce Store',
  },
  description: 'Admin panel for managing your ecommerce store',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-root">
      <style>{`
        @media print { header, footer, .announcement-bar, [data-announcement], .free-shipping-banner { display: none !important; } }
      `}</style>
      {children}
    </div>
  )
}




