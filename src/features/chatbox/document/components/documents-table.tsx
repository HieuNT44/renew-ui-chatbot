import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { FileSearch, Plus, SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { type Document } from '../data/documents'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { documentsColumns as columns } from './documents-columns'

type DataTableProps = {
  data: Document[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

function AddDocumentButton() {
  const navigate = useNavigate()

  const handleCreate = () => {
    navigate({
      to: '/chatbox/document/new',
    })
  }

  return (
    <Button
      className='bg-blue-600 text-white hover:bg-blue-700'
      onClick={handleCreate}
    >
      <Plus className='h-4 w-4' />
      ドキュメントを追加
    </Button>
  )
}

export function DocumentsTable({ data, search, navigate }: DataTableProps) {
  // Local UI-only states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Synced with URL states
  const {
    globalFilter,
    onGlobalFilterChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      globalFilter,
      pagination,
    },
    enableRowSelection: false,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const name = String(row.getValue('name')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return name.includes(searchValue)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange,
    onGlobalFilterChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <div className='flex items-center justify-end gap-2'>
        <div className='relative w-full sm:w-40 md:w-52 lg:w-64'>
          <SearchIcon
            aria-hidden='true'
            className='text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2'
            size={18}
          />
          <Input
            placeholder='検索...'
            value={table.getState().globalFilter ?? ''}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className='bg-muted/25 h-9 ps-9 text-sm'
          />
        </div>
        <AddDocumentButton />
      </div>
      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className='bg-muted/50 hover:bg-muted/50 border-b'
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'text-foreground px-4 font-bold',
                        header.column.columnDef.meta?.className
                      )}
                      style={
                        header.column.columnDef.meta?.style || {
                          backgroundColor: '#F4F8FA',
                        }
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'px-4',
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-34'>
                  <div className='flex flex-col items-center justify-center gap-2'>
                    <FileSearch className='text-muted-foreground h-8 w-8' />
                    <p className='text-muted-foreground text-sm'>
                      結果が見つかりませんでした
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTableBulkActions table={table} />
      <div className='flex justify-end'>
        <DataTablePagination table={table} className='justify-end' />
      </div>
    </div>
  )
}
