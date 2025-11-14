import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Calendar, FileText, Pencil, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type Document } from '../data/documents'

type DocumentCardProps = {
  document: Document
  onPreview?: (document: Document) => void
  onEdit?: (document: Document) => void
}

const statusConfig = {
  completed: {
    label: '学習完了',
    className:
      'bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
  },
  processing: {
    label: '学習処理中',
    className:
      'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30',
  },
  error: {
    label: '学習エラー',
    className:
      'bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
  },
} as const

export function DocumentCard({ document, onEdit }: DocumentCardProps) {
  const status = statusConfig[document.status]
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const [isTitleOverflown, setIsTitleOverflown] = useState(false)
  const [isDescriptionOverflown, setIsDescriptionOverflown] = useState(false)

  useEffect(() => {
    const checkTitleOverflow = () => {
      if (titleRef.current) {
        const element = titleRef.current
        setIsTitleOverflown(
          element.scrollHeight > element.clientHeight ||
            element.scrollWidth > element.clientWidth
        )
      }
    }

    const checkDescriptionOverflow = () => {
      if (descriptionRef.current) {
        const element = descriptionRef.current
        setIsDescriptionOverflown(
          element.scrollHeight > element.clientHeight ||
            element.scrollWidth > element.clientWidth
        )
      }
    }

    const handleResize = () => {
      checkTitleOverflow()
      checkDescriptionOverflow()
    }

    // Use requestAnimationFrame to check after render
    const rafId = requestAnimationFrame(() => {
      checkTitleOverflow()
      checkDescriptionOverflow()
    })
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [document.name, document.documentTypes])

  const titleElement = (
    <h3
      ref={titleRef}
      className={cn(
        'line-clamp-1 min-w-0 flex-1 overflow-hidden text-lg leading-tight font-semibold',
        isTitleOverflown && 'cursor-help'
      )}
    >
      {document.name}
    </h3>
  )

  const descriptionElement = (
    <p
      ref={descriptionRef}
      className={cn(
        'text-muted-foreground line-clamp-2 min-w-0 flex-1 text-sm',
        isDescriptionOverflown && 'cursor-help'
      )}
    >
      {document.totalCharacterCount.toLocaleString('ja-JP')} 文字
    </p>
  )

  return (
    <Card className='relative flex h-full flex-col gap-0 pt-8 transition-shadow hover:shadow-md'>
      <CardHeader className='h-[50px]'>
        <div className='flex min-w-0 items-center justify-between gap-2 overflow-hidden'>
          <div className='flex h-fit shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2'>
            <FileText className='size-5 text-white' />
          </div>
          {isTitleOverflown ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>{titleElement}</TooltipTrigger>
                <TooltipContent className='max-w-sm'>
                  <p className='text-sm'>{document.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            titleElement
          )}
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
          <div className='flex items-start gap-1.5'>
            <FileText className='text-muted-foreground mt-0.5 size-4 shrink-0' />
            {isDescriptionOverflown ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>{descriptionElement}</TooltipTrigger>
                  <TooltipContent className='max-w-sm text-[12px]'>
                    <p className='text-sm'>
                      {document.documentTypes.join(', ')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              descriptionElement
            )}
          </div>
          <div className='flex flex-wrap items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <Calendar className='text-muted-foreground size-4 shrink-0' />
              <span className='text-muted-foreground text-[12px]'>
                最終更新:
              </span>
              <span className='text-[12px] font-medium'>
                {format(document.lastTrainingDate, 'yyyy年MM月dd日 HH:mm')}
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <User className='text-muted-foreground size-4 shrink-0' />
              <span className='text-muted-foreground text-[12px]'>更新者:</span>
              <span className='text-[12px] font-medium'>
                {document.lastUpdatedBy}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className='mt-auto flex h-8 items-center gap-2 border-t'>
        <Button
          variant='default'
          size='sm'
          className='!w-[80px] flex-1 text-white hover:opacity-90'
          style={{ backgroundColor: '#3B82F6' }}
          onClick={() => onEdit?.(document)}
        >
          <Pencil className='size-4' />
          編集
        </Button>
      </CardFooter>
    </Card>
  )
}
