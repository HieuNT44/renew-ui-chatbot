import { createFileRoute } from '@tanstack/react-router'
import { ChatDetail } from '@/features/chatbox/project/components/chat-detail'

export const Route = createFileRoute(
  '/_authenticated/chatbox/project/$id/recent/$chatId'
)({
  component: ChatDetail,
})

