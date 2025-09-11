interface ProductBadgeProps {
  text: string
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'gray' | 'black'
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const colorClasses = {
  red: 'bg-red-500 text-white',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  yellow: 'bg-yellow-500 text-black',
  purple: 'bg-purple-500 text-white',
  orange: 'bg-orange-500 text-white',
  gray: 'bg-gray-500 text-white',
  black: 'bg-black text-white'
}

const positionClasses = {
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-right': 'bottom-2 right-2'
}

export default function ProductBadge({ text, color, position }: ProductBadgeProps) {
  return (
    <div className={`absolute z-10 px-2 py-1 text-xs font-medium rounded-md ${colorClasses[color]} ${positionClasses[position]}`}>
      {text}
    </div>
  )
}
