import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin - Power Golf Carts',
    default: 'Admin - Power Golf Carts',
  },
  description: 'Admin panel for managing your golf cart and equipment store',
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




