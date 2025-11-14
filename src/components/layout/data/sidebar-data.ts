import { BotIcon, Command, FileText } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Conference Park',
      logo: Command,
      plan: 'Chatbot AI',
    },
  ],
  navGroups: [
    {
      title: 'Menu',
      items: [
        {
          title: 'ブレイン一覧',
          url: '/chatbox/project',
          icon: BotIcon,
        },
        {
          title: '学習用ドキュメント',
          url: '/chatbox/document',
          icon: FileText,
        },
      ],
    },
  ],
}
