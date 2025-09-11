import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        <li>
          <div>
            <Link href="/" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Home</span>
              Home
            </Link>
          </div>
        </li>
        {items.map((item, index) => (
          <li key={item.name}>
            <div className="flex items-center">
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300" aria-hidden="true" />
              <Link
                href={item.href}
                className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
