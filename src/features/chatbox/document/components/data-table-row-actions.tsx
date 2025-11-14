import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@tanstack/react-router'
import { type Row } from '@tanstack/react-table'
import { FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Document } from '../data/documents'

type DataTableRowActionsProps = {
  row: Row<Document>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const navigate = useNavigate()
  const document = row.original

  const handleEdit = () => {
    navigate({
      to: '/chatbox/document/update/$id',
      params: { id: document.id },
    })
  }

  const handleDelete = () => {
    // TODO: Implement delete functionality
    // eslint-disable-next-line no-console
    console.log('Delete document:', document.id)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={handleEdit}>
          編集
          <DropdownMenuShortcut>
            <FileText size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='text-red-500!'>
          削除
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
