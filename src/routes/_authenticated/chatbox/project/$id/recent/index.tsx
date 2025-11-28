import { createFileRoute } from '@tanstack/react-router'
import { ConversationsList } from '@/features/chatbox/project/components/conversations-list'

export const Route = createFileRoute(
  '/_authenticated/chatbox/project/$id/recent/'
)({
  component: ConversationsList,
})
