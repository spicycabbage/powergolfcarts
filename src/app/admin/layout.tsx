import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin - Insanity Golf',
    default: 'Admin - Insanity Golf',
  },
  description: 'Admin panel for managing your golf equipment store',
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




