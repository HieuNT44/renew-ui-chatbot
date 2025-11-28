import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Bot as BotIcon, Search as SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { BotCard } from './components/bot-card'
import { BotPrimaryButtons } from './components/bot-primary-buttons'
import { bots, type Bot } from './data/bots'

export function ListBot() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredBots = useMemo(() => {
    if (!searchQuery.trim()) {
      return bots
    }
    const query = searchQuery.toLowerCase()
    return bots.filter(
      (bot) =>
        bot.name.toLowerCase().includes(query) ||
        bot.lastUpdatedBy.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const handlePreview = (_bot: Bot) => {
    // TODO: Implement preview functionality
  }

  const handleEdit = (bot: Bot) => {
    navigate({ to: '/chatbox/project/update/$id', params: { id: bot.id } })
  }

  const handleShowLogs = (bot: Bot) => {
    navigate({
      to: '/chatbox/project/$id/recent',
      params: { id: bot.id },
    })
  }

  return (
    <>
      <Header fixed title='出展者ＢＯＴの管理 | 株式会社日本医工研究所'>
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-col flex-wrap items-start justify-start gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>BOT一覧</h2>
            <p className='text-muted-foreground'>ここでBOTを管理できます</p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='relative max-w-sm'>
              <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                placeholder='検索...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>
            <BotPrimaryButtons
              onClick={() => navigate({ to: '/chatbox/project/new' })}
            />
          </div>
        </div>

        {isLoading ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className='flex h-full flex-col rounded-xl border p-6 shadow-sm'
              >
                <Skeleton className='mb-4 h-[50px] w-full' />
                <Skeleton className='mb-2 h-4 w-3/4' />
                <Skeleton className='mb-4 h-4 w-1/2' />
                <Skeleton className='mt-auto h-8 w-full' />
              </div>
            ))}
          </div>
        ) : filteredBots.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <BotIcon className='text-muted-foreground mb-4 h-16 w-16' />
            <p className='text-muted-foreground text-lg'>
              {searchQuery.trim()
                ? '検索結果が見つかりませんでした'
                : 'ボットがありません'}
            </p>
            {searchQuery.trim() && (
              <p className='text-muted-foreground mt-2 text-sm'>
                「{searchQuery}」に一致するボットが見つかりませんでした
              </p>
            )}
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {filteredBots.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                onPreview={handlePreview}
                onEdit={handleEdit}
                onShowLogs={handleShowLogs}
              />
            ))}
          </div>
        )}
      </Main>
    </>
  )
}
