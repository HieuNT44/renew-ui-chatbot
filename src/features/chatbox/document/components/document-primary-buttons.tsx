import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DocumentPrimaryButtons() {
  const handleCreate = () => {
    // TODO: Implement create document functionality
  }

  return (
    <Button
      className='space-x-1 bg-blue-600 text-white hover:bg-blue-700'
      onClick={handleCreate}
    >
      <span>追加</span>
      <Plus size={18} />
    </Button>
  )
}
