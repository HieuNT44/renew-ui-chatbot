import { type Table } from '@tanstack/react-table'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Document } from '../data/documents'

type DataTableBulkActionsProps = {
  table: Table<Document>
}

export function DataTableBulkActions({ table }: DataTableBulkActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  if (selectedRows.length === 0) {
    return null
  }

  return (
    <BulkActionsToolbar table={table} entityName='document'>
      {/* Add bulk actions here if needed */}
    </BulkActionsToolbar>
  )
}
