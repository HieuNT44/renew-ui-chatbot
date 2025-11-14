import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BotPrimaryButtons({ onClick }: { onClick: () => void }) {
  return (
    <Button
      className='space-x-1 bg-blue-600 text-white hover:bg-blue-700'
      onClick={onClick}
    >
      <span>追加</span>
      <Plus size={18} />
    </Button>
  )
}
