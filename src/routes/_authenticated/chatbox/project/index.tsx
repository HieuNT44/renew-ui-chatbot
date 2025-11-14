import { createFileRoute } from '@tanstack/react-router'
import { ListBot } from '@/features/chatbox/project'

export const Route = createFileRoute('/_authenticated/chatbox/project/')({
  component: ListBot,
})
