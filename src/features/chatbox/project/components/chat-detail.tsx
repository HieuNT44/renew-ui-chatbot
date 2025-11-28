import { Fragment, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Route as ChatDetailRoute } from '@/routes/_authenticated/chatbox/project/$id/recent/$chatId'
import { ja } from 'date-fns/locale'
import {
  ArrowLeft,
  Bot as BotIcon,
  Clock,
  MessageSquareMore,
  Search as SearchIcon,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { bots } from '../data/bots'
import { mockConversationsByBot, type ChatMessage } from '../data/conversations'

export function ChatDetail() {
  const { id, chatId } = ChatDetailRoute.useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const bot = bots.find((b) => b.id === id)
  const allConversations = useMemo(() => mockConversationsByBot[id] || [], [id])
  const selectedConversation = allConversations.find(
    (conv) => conv.id === chatId
  )

  // Filter conversations for sidebar
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return allConversations
    }
    const query = searchQuery.toLowerCase()
    return allConversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query) ||
        conv.userName.toLowerCase().includes(query)
    )
  }, [allConversations, searchQuery])

  // Group messages by date
  const groupedMessages = useMemo(() => {
    if (!selectedConversation) return {}
    return selectedConversation.messages.reduce(
      (acc: Record<string, ChatMessage[]>, msg) => {
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
  }, [selectedConversation])

  // Auto-redirect if conversation not found
  useEffect(() => {
    if (!selectedConversation && allConversations.length > 0) {
      navigate({
        to: '/chatbox/project/$id/recent/$chatId',
        params: { id, chatId: allConversations[0].id },
      })
    }
  }, [selectedConversation, allConversations, id, chatId, navigate])

  if (!bot) {
    return (
      <>
        <Header fixed title='出展者ＢＯＴの管理 | 株式会社日本医工研究所'>
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
          </div>
        </Header>
        <Main className='flex flex-1 flex-col items-center justify-center'>
          <p className='text-muted-foreground'>ボットが見つかりませんでした</p>
        </Main>
      </>
    )
  }

  if (!selectedConversation) {
    return (
      <>
        <Header fixed title='出展者ＢＯＴの管理 | 株式会社日本医工研究所'>
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
          </div>
        </Header>
        <Main className='flex flex-1 flex-col items-center justify-center'>
          <p className='text-muted-foreground'>
            チャットが見つかりませんでした
          </p>
          <Button
            variant='outline'
            onClick={() =>
              navigate({
                to: '/chatbox/project/$id/recent',
                params: { id },
              })
            }
            className='mt-4'
          >
            チャット一覧に戻る
          </Button>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed title='出展者ＢＯＴの管理 | 株式会社日本医工研究所'>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      <Main fixed className='flex h-full flex-col overflow-hidden'>
        <div className='flex h-full gap-0 overflow-hidden'>
          {/* Sidebar - Conversations List */}
          <div className='bg-muted/30 flex w-64 shrink-0 flex-col border-r sm:w-80'>
            {/* Sidebar Header */}
            <div className='bg-background flex h-[73px] shrink-0 items-center gap-2 border-b py-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() =>
                  navigate({
                    to: '/chatbox/project/$id/recent',
                    params: { id },
                  })
                }
                className='h-8 w-8'
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600'>
                  <BotIcon className='h-4 w-4 text-white' />
                </div>
                <div className='flex flex-col'>
                  <h2 className='max-w-full truncate text-lg font-semibold'>
                    {bot.name}
                  </h2>
                  <p className='text-muted-foreground text-xs'>チャット履歴</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className='bg-background shrink-0 border-b p-4'>
              <div className='relative'>
                <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                <Input
                  placeholder='チャットを検索...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className='min-h-0 flex-1'>
              <div className='flex flex-col'>
                {filteredConversations.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <p className='text-muted-foreground text-sm'>
                      {searchQuery.trim()
                        ? '検索結果が見つかりませんでした'
                        : 'チャット履歴がありません'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    // Get first message content
                    const firstMessage =
                      conversation.messages.find((msg) => msg.sender === 'user')
                        ?.message ||
                      conversation.messages[0]?.message ||
                      ''

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => {
                          navigate({
                            to: '/chatbox/project/$id/recent/$chatId',
                            params: { id, chatId: conversation.id },
                          })
                        }}
                        className={cn(
                          'hover:bg-muted/50 flex flex-col gap-2 border-b p-4 text-left transition-colors',
                          selectedConversation.id === conversation.id &&
                            'bg-muted'
                        )}
                      >
                        {/* First message content */}
                        <p className='text-foreground line-clamp-1 text-[14px]'>
                          {firstMessage}
                        </p>

                        {/* Message count and user name */}
                        <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
                          {/* Message count */}
                          <div className='flex items-center gap-1.5'>
                            <MessageSquareMore className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                            <p className='text-muted-foreground text-xs'>
                              {conversation.messageCount} メッセージ
                            </p>
                          </div>

                          {/* User name */}
                          <div className='flex items-center gap-1.5'>
                            <User className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                            <p className='text-muted-foreground text-xs'>
                              {conversation.userName}
                            </p>
                          </div>

                          {/* Last message time */}
                          <div className='flex items-center gap-1.5'>
                            <Clock className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                            <p className='text-muted-foreground text-xs'>
                              {format(
                                new Date(conversation.lastMessageTime),
                                'MM月dd日 HH:mm'
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content - Chat History */}
          <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
            {/* Chat Header */}
            <div className='bg-background flex shrink-0 items-center gap-3 border-b p-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() =>
                  navigate({
                    to: '/chatbox/project/$id/recent',
                    params: { id },
                  })
                }
                className='sm:hidden'
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <div className='flex items-center gap-3'>
                <Avatar className='h-10 w-10 shrink-0'>
                  <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600'>
                    <BotIcon className='h-5 w-5 text-white' />
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <p className='truncate font-semibold'>
                    {selectedConversation.title}
                  </p>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='text-muted-foreground text-xs'>
                      {selectedConversation.userName}
                    </p>
                    <span className='text-muted-foreground text-xs'>•</span>
                    <p className='text-muted-foreground text-xs'>
                      {format(
                        new Date(selectedConversation.lastMessageTime),
                        'yyyy年MM月dd日',
                        { locale: ja }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className='min-h-0 flex-1'>
              <div className='flex flex-col gap-4 p-4'>
                {Object.keys(groupedMessages).map((dateKey) => (
                  <Fragment key={dateKey}>
                    <div className='flex items-center gap-2 py-2'>
                      <Separator className='flex-1' />
                      <span className='text-muted-foreground shrink-0 text-xs'>
                        {dateKey}
                      </span>
                      <Separator className='flex-1' />
                    </div>
                    {groupedMessages[dateKey].map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex max-w-[80%] flex-col gap-1 sm:max-w-[70%]',
                          message.sender === 'user'
                            ? 'ml-auto items-end'
                            : 'mr-auto items-start'
                        )}
                      >
                        {message.sender === 'user' && message.userName && (
                          <p className='text-muted-foreground text-xs'>
                            {message.userName}
                          </p>
                        )}
                        <div
                          className={cn(
                            'rounded-lg px-4 py-2 shadow-sm',
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <p className='text-sm break-words whitespace-pre-wrap'>
                            {message.message}
                          </p>
                        </div>
                        <p className='text-muted-foreground text-xs'>
                          {format(new Date(message.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Main>
    </>
  )
}
