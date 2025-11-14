import { createFileRoute } from '@tanstack/react-router'
import { DocumentSettings } from '@/features/chatbox/document/components/document-settings'

export const Route = createFileRoute('/_authenticated/chatbox/document/new')({
  component: DocumentSettings,
})
