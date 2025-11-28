import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Conversation } from '../data/conversations'

export type ExportFormat = 'json' | 'txt' | 'markdown'

/**
 * Export conversations to JSON format
 */
export function exportToJSON(conversations: Conversation[]): string {
  return JSON.stringify(conversations, null, 2)
}

/**
 * Export conversations to TXT format (human-readable)
 */
export function exportToTXT(conversations: Conversation[]): string {
  let content = ''

  conversations.forEach((conv, index) => {
    content += `=== Conversation ${index + 1} ===\n`
    content += `Title: ${conv.title}\n`
    content += `User: ${conv.userName} (${conv.userId})\n`
    content += `Last Message: ${format(new Date(conv.lastMessageTime), 'yyyy年MM月dd日 HH:mm', { locale: ja })}\n`
    content += `Message Count: ${conv.messageCount}\n`
    content += `\n--- Messages ---\n\n`

    conv.messages.forEach((msg, msgIndex) => {
      const sender = msg.sender === 'user' ? 'User' : 'Bot'
      const timestamp = format(new Date(msg.timestamp), 'yyyy-MM-dd HH:mm:ss', {
        locale: ja,
      })
      content += `[${timestamp}] ${sender}${msg.userName ? ` (${msg.userName})` : ''}:\n`
      content += `${msg.message}\n\n`
    })

    content += `\n${'='.repeat(50)}\n\n`
  })

  return content
}

/**
 * Export conversations to Markdown format
 */
export function exportToMarkdown(conversations: Conversation[]): string {
  let content = '# Chat Conversations Export\n\n'
  content += `**Export Date:** ${format(new Date(), 'yyyy年MM月dd日 HH:mm:ss', { locale: ja })}\n`
  content += `**Total Conversations:** ${conversations.length}\n\n`
  content += '---\n\n'

  conversations.forEach((conv, index) => {
    content += `## Conversation ${index + 1}: ${conv.title}\n\n`
    content += `- **User:** ${conv.userName} (${conv.userId})\n`
    content += `- **Last Message:** ${format(new Date(conv.lastMessageTime), 'yyyy年MM月dd日 HH:mm', { locale: ja })}\n`
    content += `- **Message Count:** ${conv.messageCount}\n\n`
    content += `### Messages\n\n`

    // Group messages by date
    const groupedMessages = conv.messages.reduce(
      (acc: Record<string, typeof conv.messages>, msg) => {
        const key = format(new Date(msg.timestamp), 'yyyy年MM月dd日', {
          locale: ja,
        })
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(msg)
        return acc
      },
      {}
    )

    Object.keys(groupedMessages).forEach((dateKey) => {
      content += `#### ${dateKey}\n\n`
      groupedMessages[dateKey].forEach((msg) => {
        const sender = msg.sender === 'user' ? '👤 User' : '🤖 Bot'
        const timestamp = format(new Date(msg.timestamp), 'HH:mm')
        content += `**${sender}** ${msg.userName ? `(${msg.userName})` : ''} - *${timestamp}*\n\n`
        content += `${msg.message}\n\n`
        content += '---\n\n'
      })
    })

    content += '\n\n'
  })

  return content
}

/**
 * Download conversations as file
 */
export function downloadConversations(
  conversations: Conversation[],
  exportFormat: ExportFormat = 'json',
  filename?: string
): void {
  let content: string
  let mimeType: string
  let extension: string

  switch (exportFormat) {
    case 'json':
      content = exportToJSON(conversations)
      mimeType = 'application/json'
      extension = 'json'
      break
    case 'txt':
      content = exportToTXT(conversations)
      mimeType = 'text/plain'
      extension = 'txt'
      break
    case 'markdown':
      content = exportToMarkdown(conversations)
      mimeType = 'text/markdown'
      extension = 'md'
      break
    default:
      content = exportToJSON(conversations)
      mimeType = 'application/json'
      extension = 'json'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  if (filename) {
    link.download = filename
  } else {
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss', { locale: ja })
    link.download = `chat_export_${timestamp}.${extension}`
  }

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
