import { createFileRoute } from '@tanstack/react-router'
import { BotSettings } from '@/features/chatbox/project/components/bot-settings'

export const Route = createFileRoute('/_authenticated/chatbox/project/new')({
  component: BotSettings,
})
