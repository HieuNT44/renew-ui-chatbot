import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { ja } from 'date-fns/locale'
import { CloudUpload, FileText, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import {
  type Document,
  type DocumentType,
  type TrainingStatus,
} from '../data/documents'

function EditButton({ documentId }: { documentId: string }) {
  const navigate = useNavigate()

  return (
    <Button
      size='sm'
      className='bg-blue-600 text-white hover:bg-blue-700'
      onClick={() => {
        navigate({
          to: '/chatbox/document/update/$id',
          params: { id: documentId },
        })
      }}
    >
      編集
    </Button>
  )
}

function DeleteButton({ document }: { document: Document }) {
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    // TODO: Implement actual delete API call
    setOpen(false)
    toast.success('ドキュメントが削除されました')
  }

  return (
    <>
      <Button size='sm' variant='destructive' onClick={() => setOpen(true)}>
        削除
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='削除の確認'
        desc={`このドキュメント「${document.name}」を削除してもよろしいですか？この操作は元に戻せません。`}
        confirmText='削除'
        cancelBtnText='キャンセル'
        destructive
        handleConfirm={handleDelete}
      />
    </>
  )
}

const statusConfig: Record<
  TrainingStatus,
  { label: string; className: string }
> = {
  completed: {
    label: '完了',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  processing: {
    label: '処理中',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  error: {
    label: 'エラー',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
}

export const documentsColumns: ColumnDef<Document>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ドキュメント名' />
    ),
    cell: ({ row }) => (
      <LongText className='w-full font-medium'>{row.getValue('name')}</LongText>
    ),
    meta: {
      className: cn('max-md:sticky start-0 w-[300px] min-w-[300px]'),
    },
    enableHiding: false,
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ステータス' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as TrainingStatus
      const config = statusConfig[status]
      return (
        <Badge variant='outline' className={cn('capitalize', config.className)}>
          {config.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: true,
  },
  {
    accessorKey: 'documentTypes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='種類' />
    ),
    cell: ({ row }) => {
      const documentTypes = row.getValue('documentTypes') as DocumentType[]
      const typeConfig: Record<
        DocumentType,
        { label: string; icon: React.ReactNode; className: string }
      > = {
        file: {
          label: 'ファイル',
          icon: <CloudUpload className='h-4 w-4' />,
          className:
            'border-teal-500 text-teal-700 bg-teal-50 hover:bg-teal-100 dark:border-teal-400 dark:text-teal-300 dark:bg-teal-950/30',
        },
        url: {
          label: 'ウェブサイト',
          icon: <Globe className='h-4 w-4' />,
          className:
            'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-300 dark:bg-blue-950/30',
        },
        text: {
          label: 'テキスト',
          icon: <FileText className='h-4 w-4' />,
          className:
            'border-slate-500 text-slate-700 bg-slate-50 hover:bg-slate-100 dark:border-slate-400 dark:text-slate-300 dark:bg-slate-950/30',
        },
      }

      return (
        <div className='flex items-center gap-2 text-sm'>
          {documentTypes.map((type) => (
            <Badge
              key={type}
              variant='outline'
              className={cn(
                'flex items-center gap-1',
                typeConfig[type].className
              )}
            >
              {typeConfig[type].icon}
              <span>{typeConfig[type].label}</span>
            </Badge>
          ))}
        </div>
      )
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const typesA = rowA.getValue('documentTypes') as DocumentType[]
      const typesB = rowB.getValue('documentTypes') as DocumentType[]
      return typesA.length - typesB.length
    },
  },
  {
    accessorKey: 'totalCharacterCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='合計文字数' />
    ),
    cell: ({ row }) => {
      const count = row.getValue('totalCharacterCount') as number
      return <div className='text-sm'>{count.toLocaleString('ja-JP')} 文字</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: 'lastTrainingDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='最終学習日' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('lastTrainingDate') as Date
      return (
        <div className='text-sm'>
          {format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: 'edit',
    header: () => <div className='font-bold'>アクション</div>,
    cell: ({ row }) => {
      const document = row.original
      return (
        <div className='flex items-center gap-2'>
          <EditButton documentId={document.id} />
          <DeleteButton document={document} />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
