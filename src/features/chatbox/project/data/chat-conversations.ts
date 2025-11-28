export type ChatMessage = {
  id: string
  sender: 'user' | 'bot'
  message: string
  timestamp: string
}

export type ChatConversation = {
  id: string
  title: string
  lastMessage: string
  lastMessageTime: string
  messages: ChatMessage[]
}

// Mock data for chat conversations
export const mockConversations: Record<string, ChatConversation[]> = {
  '1': [
    {
      id: 'conv1',
      title: '製品についての質問',
      lastMessage: 'ありがとうございます！',
      lastMessageTime: '2024-01-15T10:30:00',
      messages: [
        {
          id: 'msg1',
          sender: 'user',
          message: 'こんにちは、製品について質問があります。',
          timestamp: '2024-01-15T10:00:00',
        },
        {
          id: 'msg2',
          sender: 'bot',
          message: 'こんにちは！どの製品についてお知りになりたいですか？',
          timestamp: '2024-01-15T10:00:15',
        },
        {
          id: 'msg3',
          sender: 'user',
          message: '新製品の機能について教えてください。',
          timestamp: '2024-01-15T10:01:00',
        },
        {
          id: 'msg4',
          sender: 'bot',
          message: '新製品には以下の機能が搭載されています：\n1. AIによる自動応答\n2. 多言語対応\n3. カスタマイズ可能な設定',
          timestamp: '2024-01-15T10:01:30',
        },
        {
          id: 'msg5',
          sender: 'user',
          message: 'ありがとうございます！',
          timestamp: '2024-01-15T10:30:00',
        },
      ],
    },
    {
      id: 'conv2',
      title: 'サポートに関するお問い合わせ',
      lastMessage: '承知いたしました。',
      lastMessageTime: '2024-01-14T15:20:00',
      messages: [
        {
          id: 'msg6',
          sender: 'user',
          message: 'サポートに連絡したいです。',
          timestamp: '2024-01-14T15:00:00',
        },
        {
          id: 'msg7',
          sender: 'bot',
          message: 'サポートチームにおつなぎします。少々お待ちください。',
          timestamp: '2024-01-14T15:00:20',
        },
        {
          id: 'msg8',
          sender: 'user',
          message: 'ありがとうございます。',
          timestamp: '2024-01-14T15:10:00',
        },
        {
          id: 'msg9',
          sender: 'bot',
          message: '承知いたしました。',
          timestamp: '2024-01-14T15:20:00',
        },
      ],
    },
    {
      id: 'conv3',
      title: '価格について',
      lastMessage: '了解しました。',
      lastMessageTime: '2024-01-13T09:45:00',
      messages: [
        {
          id: 'msg10',
          sender: 'user',
          message: '価格を教えてください。',
          timestamp: '2024-01-13T09:00:00',
        },
        {
          id: 'msg11',
          sender: 'bot',
          message: 'プランによって異なります。詳細はこちらをご覧ください。',
          timestamp: '2024-01-13T09:00:30',
        },
        {
          id: 'msg12',
          sender: 'user',
          message: '了解しました。',
          timestamp: '2024-01-13T09:45:00',
        },
      ],
    },
  ],
  '2': [
    {
      id: 'conv4',
      title: '技術的な質問',
      lastMessage: '助かりました！',
      lastMessageTime: '2024-01-12T14:30:00',
      messages: [
        {
          id: 'msg13',
          sender: 'user',
          message: 'APIの使い方を教えてください。',
          timestamp: '2024-01-12T14:00:00',
        },
        {
          id: 'msg14',
          sender: 'bot',
          message: 'APIの使用方法については、ドキュメントをご参照ください。',
          timestamp: '2024-01-12T14:00:20',
        },
        {
          id: 'msg15',
          sender: 'user',
          message: '助かりました！',
          timestamp: '2024-01-12T14:30:00',
        },
      ],
    },
  ],
  '3': [
    {
      id: 'conv5',
      title: 'アカウント設定について',
      lastMessage: '設定を変更しました。',
      lastMessageTime: '2024-01-11T11:15:00',
      messages: [
        {
          id: 'msg16',
          sender: 'user',
          message: 'アカウント設定を変更したいです。',
          timestamp: '2024-01-11T11:00:00',
        },
        {
          id: 'msg17',
          sender: 'bot',
          message: '設定画面から変更できます。',
          timestamp: '2024-01-11T11:00:15',
        },
        {
          id: 'msg18',
          sender: 'user',
          message: '設定を変更しました。',
          timestamp: '2024-01-11T11:15:00',
        },
      ],
    },
  ],
}

