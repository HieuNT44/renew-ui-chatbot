import { Fragment, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Route } from '@/routes/_authenticated/chatbox/project/$id'
import { ArrowLeft, Bot as BotIcon, Search as SearchIcon } from 'lucide-react'
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
import { mockConversations, type ChatMessage } from '../data/chat-conversations'

export function BotChatHistory() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)

  const bot = bots.find((b) => b.id === id)

  const conversations = mockConversations[id] || []

  // Auto-select first conversation if available
  // Only set selectedConversationId when conversations change and nothing is already selected
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      // Defer state update to avoid cascading renders: schedule with setTimeout
      setTimeout(() => {
        setSelectedConversationId(conversations[0].id)
      }, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations])

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations
    }
    const query = searchQuery.toLowerCase()
    return conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query)
    )
  }, [conversations, searchQuery])

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  )

  // Group messages by date
  const groupedMessages = useMemo(() => {
    if (!selectedConversation) return {}
    return selectedConversation.messages.reduce(
      (acc: Record<string, ChatMessage[]>, msg) => {
        const key = format(new Date(msg.timestamp), 'yyyy年MM月dd日')
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(msg)
        return acc
      },
      {}
    )
  }, [selectedConversation])

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

  return (
    <>
      <Header fixed title='出展者ＢＯＴの管理 | 株式会社日本医工研究所'>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      <Main fixed className='flex h-full flex-col'>
        <div className='flex h-full gap-0'>
          {/* Sidebar - Chat List */}
          <div
            className={cn(
              'bg-muted/30 flex w-full flex-col border-r transition-all',
              selectedConversationId
                ? 'hidden lg:flex lg:w-80'
                : 'w-full lg:w-80'
            )}
          >
            {/* Sidebar Header */}
            <div className='bg-background flex shrink-0 items-center gap-2 border-b p-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => navigate({ to: '/chatbox/project' })}
                className='h-8 w-8'
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600'>
                  <BotIcon className='h-4 w-4 text-white' />
                </div>
                <div className='flex flex-col'>
                  <h2 className='text-sm font-semibold'>{bot.name}</h2>
                  <p className='text-muted-foreground text-xs'>チャット履歴</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className='bg-background border-b p-4'>
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

            {/* Chat List */}
            <ScrollArea className='flex-1'>
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
                  filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={cn(
                        'hover:bg-muted/50 flex items-start gap-3 border-b p-4 text-left transition-colors',
                        selectedConversationId === conversation.id && 'bg-muted'
                      )}
                    >
                      <Avatar className='h-10 w-10 shrink-0'>
                        <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600'>
                          <BotIcon className='h-5 w-5 text-white' />
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex min-w-0 flex-1 flex-col gap-1'>
                        <p className='truncate text-sm font-medium'>
                          {conversation.title}
                        </p>
                        <p className='text-muted-foreground truncate text-xs'>
                          {conversation.lastMessage}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {format(
                            new Date(conversation.lastMessageTime),
                            'MM月dd日 HH:mm'
                          )}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content - Chat History */}
          {selectedConversation ? (
            <div className='flex flex-1 flex-col'>
              {/* Chat Header */}
              <div className='bg-background flex shrink-0 items-center gap-3 border-b p-4'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setSelectedConversationId(null)}
                  className='lg:hidden'
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600'>
                      <BotIcon className='h-5 w-5 text-white' />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-semibold'>
                      {selectedConversation.title}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {format(
                        new Date(selectedConversation.lastMessageTime),
                        'yyyy年MM月dd日'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className='flex-1'>
                <div className='flex flex-col gap-4 p-4'>
                  {Object.keys(groupedMessages).map((dateKey) => (
                    <Fragment key={dateKey}>
                      <div className='flex items-center gap-2 py-2'>
                        <Separator className='flex-1' />
                        <span className='text-muted-foreground text-xs'>
                          {dateKey}
                        </span>
                        <Separator className='flex-1' />
                      </div>
                      {groupedMessages[dateKey].map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            'flex max-w-[80%] flex-col gap-1',
                            message.sender === 'user'
                              ? 'ml-auto items-end'
                              : 'mr-auto items-start'
                          )}
                        >
                          <div
                            className={cn(
                              'rounded-lg px-4 py-2 shadow-sm',
                              message.sender === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            <p className='text-sm'>{message.message}</p>
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
          ) : (
            <div className='hidden flex-1 items-center justify-center lg:flex'>
              <div className='flex flex-col items-center gap-2 text-center'>
                <BotIcon className='text-muted-foreground h-12 w-12' />
                <p className='text-muted-foreground'>
                  チャットを選択して履歴を表示
                </p>
              </div>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
