import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
} from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'

type DataTableColumnHeaderProps<TData, TValue> =
  React.HTMLAttributes<HTMLDivElement> & {
    column: Column<TData, TValue>
    title: string
  }

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn('font-bold', className)}>{title}</div>
  }

  return (
    <div
      className={cn(
        'flex cursor-pointer items-center space-x-2 font-bold select-none',
        className
      )}
      onClick={() => column.toggleSorting()}
    >
      <span>{title}</span>
      {column.getIsSorted() === 'desc' ? (
        <ArrowDownIcon className='h-4 w-4' />
      ) : column.getIsSorted() === 'asc' ? (
        <ArrowUpIcon className='h-4 w-4' />
      ) : (
        <CaretSortIcon className='h-4 w-4 opacity-50' />
      )}
    </div>
  )
}
