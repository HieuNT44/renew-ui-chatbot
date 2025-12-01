import { useMemo, useState } from 'react'
import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subQuarters,
  subWeeks,
  subYears,
} from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Route } from '@/routes/_authenticated/chatbox/project/$id/recent'
import {
  ArrowLeft,
  Bot as BotIcon,
  Check,
  ChevronsUpDown,
  Clock,
  Download,
  Eye,
  MessageSquare,
  MessageSquareMore,
  Search as SearchIcon,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DatePicker } from '@/components/date-picker'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { bots } from '../data/bots'
import { mockConversationsByBot } from '../data/conversations'
import { downloadConversations } from '../utils/export-conversations'

// User Combobox Component
type UserComboboxProps = {
  users: Array<{ userId: string; userName: string }>
  selectedUserId: string | undefined
  onSelect: (userId: string | undefined) => void
}

function UserCombobox({ users, selectedUserId, onSelect }: UserComboboxProps) {
  const [open, setOpen] = useState(false)

  const selectedUser = users.find((u) => u.userId === selectedUserId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className={cn(
            'w-full justify-between',
            !selectedUser && 'text-muted-foreground'
          )}
        >
          {selectedUser ? selectedUser.userName : 'ユーザーを選択'}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command>
          <CommandInput placeholder='ユーザーを検索...' />
          <CommandList>
            <CommandEmpty className='text-muted-foreground p-2 text-[12px]'>
              検索結果が見つかりませんでした
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onSelect(undefined)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    !selectedUserId ? 'opacity-100' : 'opacity-0'
                  )}
                />
                すべてのユーザー
              </CommandItem>
              {users.map((user) => {
                const isSelected = selectedUserId === user.userId
                return (
                  <CommandItem
                    key={user.userId}
                    value={user.userName}
                    onSelect={() => {
                      onSelect(isSelected ? undefined : user.userId)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {user.userName}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function ConversationsList() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    undefined
  )
  const [displayCount, setDisplayCount] = useState(10)
  const [usersPeriod, setUsersPeriod] = useState('week')
  const [questionsPeriod, setQuestionsPeriod] = useState('week')
  const [selectedConversations, setSelectedConversations] = useState<
    Set<string>
  >(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConversationId, setDeleteConversationId] = useState<
    string | null
  >(null)

  const bot = bots.find((b) => b.id === id)
  const allConversations = useMemo(() => mockConversationsByBot[id] || [], [id])

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Map<string, string>()
    allConversations.forEach((conv) => {
      if (!users.has(conv.userId)) {
        users.set(conv.userId, conv.userName)
      }
    })
    return Array.from(users.entries()).map(([userId, userName]) => ({
      userId,
      userName,
    }))
  }, [allConversations])

  const filteredConversations = useMemo(() => {
    let filtered = allConversations

    // Search filter
    if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
      (conv) =>
        conv.title.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query) ||
        conv.userName.toLowerCase().includes(query)
    )
    }

    // Date range filter
    if (startDate || endDate) {
      filtered = filtered.filter((conv) => {
        const convDate = new Date(conv.lastMessageTime)
        const convDateOnly = new Date(
          convDate.getFullYear(),
          convDate.getMonth(),
          convDate.getDate()
        )

        if (startDate && endDate) {
          const start = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          )
          const end = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
          )
          return convDateOnly >= start && convDateOnly <= end
        }
        if (startDate) {
          const start = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          )
          return convDateOnly >= start
        }
        if (endDate) {
          const end = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
          )
          return convDateOnly <= end
        }
        return true
      })
    }

    // User filter
    if (selectedUserId) {
      filtered = filtered.filter((conv) => conv.userId === selectedUserId)
    }

    return filtered
  }, [allConversations, searchQuery, startDate, endDate, selectedUserId])

  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      return (
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
      )
    })
  }, [filteredConversations])

  const displayedConversations = useMemo(() => {
    return sortedConversations.slice(0, displayCount)
  }, [sortedConversations, displayCount])

  const hasMore = sortedConversations.length > displayCount

  const handleShowMore = () => {
    setDisplayCount((prev) => prev + 10)
  }

  const handleExport = () => {
    if (selectedConversations.size === 0) {
      toast.error('チャットが選択されていません')
      return
    }

    try {
      const conversationsToExport = allConversations.filter((conv) =>
        selectedConversations.has(conv.id)
      )

      if (conversationsToExport.length === 0) {
        toast.error('エクスポートするチャットが見つかりませんでした')
        return
      }

      downloadConversations(conversationsToExport, 'json')
      toast.success(
        `${conversationsToExport.length} 件のチャットをエクスポートしました`
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Export error:', error)
      toast.error('エクスポート中にエラーが発生しました')
    }
  }

  // Helper function to get date range for period
  const getDateRange = (period: string) => {
    const now = new Date()
    let start: Date
    const end: Date = endOfDay(now)

    switch (period) {
      case 'day': {
        start = startOfDay(now)
        break
      }
      case 'week': {
        start = startOfDay(startOfWeek(now, { weekStartsOn: 1 }))
        break
      }
      case 'month': {
        start = startOfDay(startOfMonth(now))
        break
      }
      case 'quarter': {
        start = startOfDay(startOfQuarter(now))
        break
      }
      case 'year': {
        start = startOfDay(startOfYear(now))
        break
      }
      default: {
        start = startOfDay(startOfWeek(now, { weekStartsOn: 1 }))
      }
    }

    return { start, end }
  }

  // Helper function to get previous period date range
  const getPreviousPeriodRange = (period: string) => {
    const now = new Date()
    let start: Date
    let end: Date

    switch (period) {
      case 'day': {
        const yesterday = subDays(now, 1)
        start = startOfDay(yesterday)
        end = endOfDay(yesterday)
        break
      }
      case 'week': {
        const lastWeek = subWeeks(now, 1)
        start = startOfDay(startOfWeek(lastWeek, { weekStartsOn: 1 }))
        end = endOfDay(
          new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
        )
        break
      }
      case 'month': {
        const lastMonth = subMonths(now, 1)
        start = startOfDay(startOfMonth(lastMonth))
        end = endOfDay(endOfMonth(lastMonth))
        break
      }
      case 'quarter': {
        const lastQuarter = subQuarters(now, 1)
        start = startOfDay(startOfQuarter(lastQuarter))
        end = endOfDay(endOfQuarter(lastQuarter))
        break
      }
      case 'year': {
        const lastYear = subYears(now, 1)
        start = startOfDay(startOfYear(lastYear))
        end = endOfDay(endOfYear(lastYear))
        break
      }
      default: {
        const lastWeekDefault = subWeeks(now, 1)
        start = startOfDay(startOfWeek(lastWeekDefault, { weekStartsOn: 1 }))
        end = endOfDay(
          new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
        )
      }
    }

    return { start, end }
  }

  // Calculate statistics for users
  const usersStatistics = useMemo(() => {
    const { start, end } = getDateRange(usersPeriod)
    const { start: prevStart, end: prevEnd } =
      getPreviousPeriodRange(usersPeriod)

    const currentConversations = allConversations.filter((conv) => {
      const convDate = new Date(conv.lastMessageTime)
      return isWithinInterval(convDate, { start, end })
    })

    const previousConversations = allConversations.filter((conv) => {
      const convDate = new Date(conv.lastMessageTime)
      return isWithinInterval(convDate, { start: prevStart, end: prevEnd })
    })

    const currentUsers = new Set(
      currentConversations.map((conv) => conv.userId)
    ).size
    const previousUsers = new Set(
      previousConversations.map((conv) => conv.userId)
    ).size

    const growth =
      previousUsers > 0
        ? ((currentUsers - previousUsers) / previousUsers) * 100
        : currentUsers > 0
          ? 100
          : 0

    return {
      value: currentUsers,
      growth,
    }
  }, [allConversations, usersPeriod])

  // Calculate statistics for questions
  const questionsStatistics = useMemo(() => {
    const { start, end } = getDateRange(questionsPeriod)
    const { start: prevStart, end: prevEnd } =
      getPreviousPeriodRange(questionsPeriod)

    const currentConversations = allConversations.filter((conv) => {
      const convDate = new Date(conv.lastMessageTime)
      return isWithinInterval(convDate, { start, end })
    })

    const previousConversations = allConversations.filter((conv) => {
      const convDate = new Date(conv.lastMessageTime)
      return isWithinInterval(convDate, { start: prevStart, end: prevEnd })
    })

    const currentQuestions = currentConversations.reduce(
      (sum, conv) =>
        sum + conv.messages.filter((msg) => msg.sender === 'user').length,
      0
    )

    const previousQuestions = previousConversations.reduce(
      (sum, conv) =>
        sum + conv.messages.filter((msg) => msg.sender === 'user').length,
      0
    )

    const growth =
      previousQuestions > 0
        ? ((currentQuestions - previousQuestions) / previousQuestions) * 100
        : currentQuestions > 0
          ? 100
          : 0

    return {
      value: currentQuestions,
      growth,
    }
  }, [allConversations, questionsPeriod])

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

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Header Section */}
        <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => navigate({ to: '/chatbox/project' })}
                className='h-8 w-8'
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600'>
            <BotIcon className='h-4 w-4 text-white' />
          </div>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-bold'>{bot.name}</h2>
            <span className='text-muted-foreground text-sm'>
              チャット履歴
            </span>
          </div>
        </div>

        {/* Statistics Section */}
        <div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              {/* Users Card */}
              <Card>
                <CardContent className='px-5'>
                  <div className='flex flex-col gap-3'>
                    <div className='flex items-center justify-between gap-3'>
                      <p className='text-lg font-bold'>ユーザー数</p>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20'>
                        <Users className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                      </div>
                    </div>
                    <div className='flex items-center gap-5'>
                      <p className='text-3xl font-semibold'>
                        {usersStatistics.value}
                      </p>
                      <Select
                        value={usersPeriod}
                        onValueChange={setUsersPeriod}
                      >
                        <SelectTrigger className='h-8 w-[100px]'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='day'>1日</SelectItem>
                          <SelectItem value='week'>1週間</SelectItem>
                          <SelectItem value='month'>1ヶ月</SelectItem>
                          <SelectItem value='quarter'>1四半期</SelectItem>
                          <SelectItem value='year'>1年</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p
                        className={cn(
                          'text-xs',
                          usersStatistics.growth >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {usersStatistics.growth >= 0 ? '+' : ''}
                        {usersStatistics.growth.toFixed(1)}% 前
                        {usersPeriod === 'day'
                          ? '日'
                          : usersPeriod === 'week'
                            ? '週'
                            : usersPeriod === 'month'
                              ? '月'
                              : usersPeriod === 'quarter'
                                ? '四半期'
                                : '年'}
                        比
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className='px-5'>
                  <div className='flex flex-col gap-3'>
                    <div className='flex items-center justify-between gap-3'>
                      <p className='text-lg font-bold'>質問数</p>
                      <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20'>
                        <MessageSquare className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                      </div>
                    </div>
                    <div className='flex items-center gap-5'>
                      <p className='text-3xl font-semibold'>
                        {questionsStatistics.value}
                      </p>
                      <Select
                        value={questionsPeriod}
                        onValueChange={setQuestionsPeriod}
                      >
                        <SelectTrigger className='h-8 w-[100px]'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='day'>1日</SelectItem>
                          <SelectItem value='week'>1週間</SelectItem>
                          <SelectItem value='month'>1ヶ月</SelectItem>
                          <SelectItem value='quarter'>1四半期</SelectItem>
                          <SelectItem value='year'>1年</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p
                        className={cn(
                          'text-xs',
                          questionsStatistics.growth >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {questionsStatistics.growth >= 0 ? '+' : ''}
                        {questionsStatistics.growth.toFixed(1)}% 前
                        {questionsPeriod === 'day'
                          ? '日'
                          : questionsPeriod === 'week'
                            ? '週'
                            : questionsPeriod === 'month'
                              ? '月'
                              : questionsPeriod === 'quarter'
                                ? '四半期'
                                : '年'}
                        比
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        {/* Filter Section */}
        <div className='flex flex-col gap-4'>
          {/* Filter Row */}
          <div className='flex flex-col gap-4 sm:flex-row'>
          {/* Search */}
            <div className='relative flex-1'>
              <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='チャットを検索...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            <div className='flex w-full sm:w-[250px] sm:min-w-[250px]'>
              <UserCombobox
                users={uniqueUsers}
                selectedUserId={selectedUserId}
                onSelect={setSelectedUserId}
              />
            </div>

            {/* Date Range and User Filter */}
            <div className='flex w-full flex-wrap items-center gap-2 sm:w-fit sm:flex-nowrap'>
              {/* Start Date */}
              <div className='flex-1 sm:flex-none'>
                <DatePicker
                  selected={startDate}
                  onSelect={setStartDate}
                  placeholder='開始日を選択'
                />
              </div>
              <span className='text-muted-foreground shrink-0 text-xs'>
                〜
              </span>
              {/* End Date */}
              <div className='flex-1 sm:flex-none'>
                <DatePicker
                  selected={endDate}
                  onSelect={setEndDate}
                  placeholder='終了日を選択'
                />
              </div>
            </div>
          </div>

          {/* Selection Action Bar */}
          <div className='flex min-h-[30px] flex-wrap items-center justify-between gap-2'>
            <div className='flex flex-wrap items-center gap-2'>
              {selectedConversations.size > 0 ? (
                <>
                  <p className='text-muted-foreground text-sm'>
                    {selectedConversations.size} selected
                  </p>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300'
                    onClick={() => {
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className='h-4 w-4' />
                    <span className='sr-only'>削除</span>
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20 dark:hover:text-blue-300'
                    onClick={handleExport}
                  >
                    <Download className='h-4 w-4' />
                    <span className='sr-only'>エクスポート</span>
                  </Button>
              <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                onClick={() => {
                      setSelectedConversations(new Set())
                }}
              >
                    <X className='h-4 w-4' />
                    <span className='sr-only'>選択を解除</span>
              </Button>
                </>
              ) : (
                <>
                  <p className='text-muted-foreground text-sm'>
                    {sortedConversations.length} チャット
                  </p>
                  <button
                    className='text-primary cursor-pointer text-sm font-medium underline hover:underline'
                    onClick={() => {
                      const allIds = new Set(
                        displayedConversations.map((conv) => conv.id)
                      )
                      setSelectedConversations(allIds)
                    }}
                  >
                    全選択
                  </button>
                </>
              )}
            </div>
            </div>
          </div>

          {/* Conversations List */}
            <div className='flex flex-col'>
              {displayedConversations.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                  <BotIcon className='text-muted-foreground mb-4 h-12 w-12' />
                  <p className='text-muted-foreground text-[10px]'>
                    {searchQuery.trim()
                      ? '検索結果が見つかりませんでした'
                      : 'チャット履歴がありません'}
                  </p>
                </div>
              ) : (
                <>
                  {displayedConversations.map((conversation) => {
                    // Get first message content
                    const firstMessage =
                      conversation.messages.find((msg) => msg.sender === 'user')
                        ?.message ||
                      conversation.messages[0]?.message ||
                      ''

                    const isSelected = selectedConversations.has(
                      conversation.id
                    )

                    return (
                  <div
                    key={conversation.id}
                        className={cn(
                          'hover:bg-muted/50 flex flex-col gap-3 border-b p-4 transition-colors sm:flex-row sm:items-start sm:justify-between',
                          isSelected && 'bg-muted/30'
                        )}
                      >
                        <div className='flex min-w-0 flex-1 items-start gap-3'>
                          {/* Checkbox */}
                          <div className='flex shrink-0 items-center pt-1'>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                setSelectedConversations((prev) => {
                                  const newSet = new Set(prev)
                                  if (checked) {
                                    newSet.add(conversation.id)
                                  } else {
                                    newSet.delete(conversation.id)
                                  }
                                  return newSet
                                })
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            />
                          </div>
                          {/* Left side - Clickable content */}
                          <button
                            onClick={() => {
                              navigate({
                                to: '/chatbox/project/$id/recent/$chatId',
                                params: { id, chatId: conversation.id },
                              })
                            }}
                            className='flex min-w-0 flex-1 flex-col gap-2 text-left'
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
                        </div>
                        {/* Right side - Action Buttons */}
                        <div className='flex shrink-0 items-center justify-end gap-1 sm:h-[45px]'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate({
                                to: '/chatbox/project/$id/recent/$chatId',
                                params: { id, chatId: conversation.id },
                              })
                            }}
                            title='詳細を見る'
                          >
                            <Eye className='h-4 w-4' />
                            <span className='sr-only'>詳細を見る</span>
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20 dark:hover:text-blue-300'
                            onClick={(e) => {
                              e.stopPropagation()
                              try {
                                const conversationToExport =
                                  allConversations.find(
                                    (conv) => conv.id === conversation.id
                                  )
                                if (conversationToExport) {
                                  downloadConversations(
                                    [conversationToExport],
                                    'json'
                                  )
                                  toast.success(
                                    'チャットをエクスポートしました'
                                  )
                                } else {
                                  toast.error('チャットが見つかりませんでした')
                                }
                              } catch (error) {
                                // eslint-disable-next-line no-console
                                console.error('Export error:', error)
                                toast.error(
                                  'エクスポート中にエラーが発生しました'
                                )
                              }
                            }}
                            title='エクスポート'
                          >
                            <Download className='h-4 w-4' />
                            <span className='sr-only'>エクスポート</span>
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300'
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteConversationId(conversation.id)
                              setDeleteDialogOpen(true)
                            }}
                            title='削除'
                          >
                            <Trash2 className='h-4 w-4' />
                            <span className='sr-only'>削除</span>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
              {hasMore && (
                <div className='flex items-center justify-center p-4'>
                  <Button
                    variant='outline'
                    onClick={handleShowMore}
                    className='w-full sm:w-auto'
                  >
                    もっと見る
                    </Button>
                  </div>
              )}
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) {
            setDeleteConversationId(null)
          }
        }}
        title='削除の確認'
        desc={
          deleteConversationId
            ? 'このチャットを削除してもよろしいですか？この操作は元に戻せません。'
            : `選択した ${selectedConversations.size} 件のチャットを削除してもよろしいですか？この操作は元に戻せません。`
        }
        cancelBtnText='キャンセル'
        confirmText='削除'
        destructive
        handleConfirm={() => {
          // TODO: Implement delete action
          if (deleteConversationId) {
            // Delete single conversation
            // TODO: Implement delete single conversation
            setSelectedConversations((prev) => {
              const newSet = new Set(prev)
              newSet.delete(deleteConversationId)
              return newSet
            })
          } else {
            // Delete selected conversations
            // TODO: Implement delete selected conversations
            setSelectedConversations(new Set())
          }
          setDeleteDialogOpen(false)
          setDeleteConversationId(null)
        }}
      />
    </>
  )
}
