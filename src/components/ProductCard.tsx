import Link from 'next/link'
import Image from 'next/image'
import VariantCard from '@/components/product/VariantCard'

export function ProductCard({ product }: { product: any }) {
  return <VariantCard product={product} />
}



