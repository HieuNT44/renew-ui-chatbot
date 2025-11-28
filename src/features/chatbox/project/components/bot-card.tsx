import { useRef } from 'react'
import { format } from 'date-fns'
import {
  Bot as BotIcon,
  Calendar,
  Eye,
  History,
  Pencil,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { type Bot } from '../data/bots'

type BotCardProps = {
  bot: Bot
  onPreview?: (bot: Bot) => void
  onEdit?: (bot: Bot) => void
  onShowLogs?: (bot: Bot) => void
}

const statusConfig = {
  completed: {
    label: '学習完了',
    className:
      'bg-green-500/10 text-green-700 border-green-500/20 shadow-md shadow-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 dark:shadow-green-500/30',
  },
  processing: {
    label: '学習処理中',
    className:
      'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 shadow-md shadow-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30 dark:shadow-yellow-500/30',
  },
  error: {
    label: '学習エラー',
    className:
      'bg-red-500/10 text-red-700 border-red-500/20 shadow-md shadow-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 dark:shadow-red-500/30',
  },
} as const

export function BotCard({ bot, onPreview, onEdit, onShowLogs }: BotCardProps) {
  const status = statusConfig[bot.status]
  const titleRef = useRef<HTMLHeadingElement>(null)

  const titleElement = (
    <h3
      ref={titleRef}
      className='line-clamp-1 min-w-0 flex-1 overflow-hidden text-lg leading-tight font-semibold'
    >
      {bot.name}
    </h3>
  )

  return (
    <Card className='relative flex h-full flex-col gap-0 pt-8 transition-shadow hover:shadow-md'>
      <CardHeader className='h-[50px]'>
        <div className='flex min-w-0 items-center justify-between gap-2 overflow-hidden'>
          <div className='flex h-fit shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2'>
            <BotIcon className='size-5 text-white' />
          </div>
          {titleElement}
        </div>
      </CardHeader>
      <CardContent className='mb-4 flex-1 pt-0'>
        <div className='flex h-full flex-col gap-3'>
          <Badge
            variant='outline'
            className={cn('absolute top-2 right-2 shrink-0', status.className)}
          >
            {status.label}
          </Badge>
          {/* <div className='flex items-center gap-1.5 text-xs'>
            {bot.documentTypes.map((type) => {
              const { Icon } = typeConfig[type]
              return (
                <Badge
                  key={type}
                  variant='outline'
                  className={cn(
                    'flex items-center gap-0.5 px-1.5 py-0.5 text-[10px]',
                    typeConfig[type].className
                  )}
                >
                  <Icon className='h-3 w-3' />
                  <span>{typeConfig[type].label}</span>
                </Badge>
              )
            })}
          </div> */}
          <div className='flex flex-wrap items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <Calendar className='text-muted-foreground size-4 shrink-0' />
              <span className='text-muted-foreground text-[12px]'>
                最終更新:
              </span>
              <span className='text-[12px] font-medium'>
                {format(bot.lastTrainingDate, 'yyyy年MM月dd日 HH:mm')}
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <User className='text-muted-foreground size-4 shrink-0' />
              <span className='text-muted-foreground text-[12px]'>更新者:</span>
              <span className='text-[12px] font-medium'>
                {bot.lastUpdatedBy}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className='mt-auto flex flex-col gap-2 border-t'>
        <div className='flex w-full items-center gap-2'>
          <Button
            variant='default'
            size='sm'
            className='flex-1 text-white hover:opacity-90'
            style={{ backgroundColor: '#19A2B8' }}
            onClick={() => {
              window.open(
                'http://35.213.11.57/conference/1/company/5?click-action=company_card_at_company_index&point-action=collaboration_company_show',
                '_blank',
                'noopener,noreferrer'
              )
              onPreview?.(bot)
            }}
          >
            <Eye className='size-4' />
            プレビュー
          </Button>
          <Button
            variant='default'
            size='sm'
            className='flex-1 text-white hover:opacity-90'
            style={{ backgroundColor: '#3B82F6' }}
            onClick={() => onEdit?.(bot)}
          >
            <Pencil className='size-4' />
            編集
          </Button>
        </div>
        <Button
          variant='outline'
          size='sm'
          className='w-full'
          onClick={() => onShowLogs?.(bot)}
        >
          <History className='size-4' />
          ログを見る
        </Button>
      </CardFooter>
    </Card>
  )
}
