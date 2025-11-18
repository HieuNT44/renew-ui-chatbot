import { useState } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { Route as UpdateRoute } from '@/routes/_authenticated/chatbox/project/update/$id'
import {
  Check,
  ChevronsUpDown,
  Copy,
  Info,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { bots } from '../data/bots'

const trainingDataOptions = [
  { value: 'data1', label: '学習データ 1' },
  { value: 'data2', label: '学習データ 2' },
  { value: 'data3', label: '学習データ 3' },
  { value: 'data4', label: '学習データ 4' },
  { value: 'data5', label: '学習データ 5' },
]

type TrainingDataComboboxProps = {
  value?: string[]
  onValueChange: (value: string[]) => void
}

function TrainingDataCombobox({
  value = [],
  onValueChange,
}: TrainingDataComboboxProps) {
  const [open, setOpen] = useState(false)
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(
    undefined
  )

  const selectedOptions = trainingDataOptions.filter((option) =>
    value.includes(option.value)
  )

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onValueChange(newValue)
  }

  const handleRemove = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation()
    const newValue = value.filter((v) => v !== optionValue)
    onValueChange(newValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={(el) => {
            if (el) {
              setTriggerWidth(el.offsetWidth)
            }
          }}
          variant='outline'
          role='combobox'
          className={cn(
            'h-auto min-h-10 w-full justify-between py-2',
            value.length === 0 && 'text-muted-foreground'
          )}
        >
          <div className='flex flex-1 flex-wrap items-center gap-1.5'>
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant='secondary'
                  className='mr-0.5 rounded-sm bg-slate-200 px-1.5 py-0.5 text-xs dark:bg-slate-700'
                >
                  {option.label}
                  <button
                    type='button'
                    className='ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        e.stopPropagation()
                        const newValue = value.filter((v) => v !== option.value)
                        onValueChange(newValue)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => handleRemove(e, option.value)}
                  >
                    <X className='text-muted-foreground hover:text-foreground h-3 w-3' />
                  </button>
                </Badge>
              ))
            ) : (
              <span className='text-muted-foreground'>学習データを選択</span>
            )}
          </div>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='p-0'
        align='start'
        style={{ width: triggerWidth ? `${triggerWidth}px` : undefined }}
      >
        <Command>
          <CommandInput placeholder='学習データを検索...' />
          <CommandList>
            <CommandEmpty>検索結果が見つかりませんでした</CommandEmpty>
            <CommandGroup>
              {trainingDataOptions.map((option) => {
                const isSelected = value.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      handleToggle(option.value)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
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

const defaultEmbedScript = `<script 
  src="http://35.213.11.57/sdk/embed.js?v1" 
  projectId="513124d5-fcb1-4cef-8c44-ee9c3e9320f3" 
  botName="Cat Company" 
  domain="http://35.213.11.57/sdk/interface.html?projectId=513124d5-fcb1-4cef-8c44-ee9c3e9320f3&nameBot=Cat Company&userId=1" 
  defer>
</script>`

const botSettingsSchema = z.object({
  name: z.string().min(1, 'チャットボット名は必須です'),
  trainingData: z.array(z.string()).min(1, '学習データを選択してください'),
  enableInitialGreeting: z.boolean(),
  initialGreeting: z.string().optional(),
  embedScript: z.string(),
})

type BotSettingsFormValues = z.infer<typeof botSettingsSchema>

export function BotSettings() {
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = location.pathname === '/chatbox/project/new'

  // Try to get id from update route, if it exists
  let id: string | undefined
  try {
    const params = UpdateRoute.useParams()
    id = params.id
  } catch {
    // Not in update route, so it's new route
    id = undefined
  }

  const bot = isNew ? undefined : bots.find((b) => b.id === id)

  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const form = useForm<BotSettingsFormValues>({
    resolver: zodResolver(botSettingsSchema),
    defaultValues: {
      name: isNew ? '' : bot?.name || 'サンプルチャットボット',
      trainingData: isNew
        ? []
        : bot?.id === '1'
          ? ['data1', 'data2']
          : bot?.id === '2'
            ? ['data3']
            : ['data1', 'data3', 'data4'],
      enableInitialGreeting: isNew
        ? false
        : bot?.id === '1' || bot?.id === '3'
          ? true
          : false,
      initialGreeting: isNew
        ? ''
        : bot?.id === '1' || bot?.id === '3'
          ? 'こんにちは！お問い合わせありがとうございます。どのようにお手伝いできますか？'
          : '',
      embedScript: defaultEmbedScript,
    },
  })

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(defaultEmbedScript)
      toast.success('スクリプトをコピーしました')
    } catch {
      toast.error('コピーに失敗しました')
    }
  }

  const defaultInitialGreeting =
    'こんにちは！お問い合わせありがとうございます。どのようにお手伝いできますか？'

  const handleResetGreeting = () => {
    form.setValue('initialGreeting', defaultInitialGreeting)
    toast.success('初期挨拶をリセットしました')
  }

  const enableInitialGreeting = useWatch({
    control: form.control,
    name: 'enableInitialGreeting',
  })

  const handleUpdate = async (_data: BotSettingsFormValues) => {
    setIsLoading(true)
    // TODO: Implement update functionality
    setTimeout(() => {
      setIsLoading(false)
      toast.success('チャットボット設定が更新されました')
      navigate({ to: '/chatbox/project' })
    }, 1000)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    // TODO: Implement delete functionality
    setShowDeleteDialog(false)
    toast.error('チャットボットが削除されました')
    navigate({ to: '/chatbox/project' })
  }

  const handleCancel = () => {
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = () => {
    setShowCancelDialog(false)
    navigate({ to: '/chatbox/project' })
  }

  if (!isNew && !bot) {
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
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            {isNew ? '新規チャットボット作成' : 'チャットボット設定'}
          </h2>
        </div>
        <Separator />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className='max-w-5xl space-y-6 px-5'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <span className='block font-bold'>チャットボット名</span>
                  <FormControl>
                    <Input placeholder='チャットボット名を入力' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='trainingData'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <span className='block font-bold'>学習データ選択</span>
                  <FormControl>
                    <TrainingDataCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isNew && (
              <>
                <div className='space-y-2'>
                  <FormField
                    control={form.control}
                    name='enableInitialGreeting'
                    render={({ field }) => (
                      <FormItem className='flex w-full flex-row items-center justify-between space-y-0 space-x-3'>
                        <div className='flex items-center gap-2'>
                          <span className='font-bold'>AIの初期挨拶</span>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className='text-muted-foreground h-4 w-4 cursor-help' />
                              </TooltipTrigger>
                              <TooltipContent className='max-w-xs'>
                                <div className='space-y-1 text-xs'>
                                  <p>
                                    この機能を有効にすると、チャットボットが最初にユーザーに送信する挨拶メッセージを設定できます。
                                  </p>
                                  <p>
                                    初期挨拶は、ユーザーがチャットを開始した際に自動的に表示され、BOTの第一印象を形成します。
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={handleResetGreeting}
                            disabled={!enableInitialGreeting}
                            className='h-8'
                          >
                            <RotateCcw className='mr-2 h-4 w-4' />
                            初期挨拶をリセット
                          </Button>
                          <FormControl>
                            <Checkbox
                              id={field.name}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className='border-foreground/20 data-[state=checked]:border-primary border-2'
                            />
                          </FormControl>
                          <label
                            htmlFor={field.name}
                            className='text-muted-foreground cursor-pointer text-sm'
                          >
                            有効にする
                          </label>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='initialGreeting'
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder='AIの初期挨拶を入力'
                            className='r min-h-24 disabled:bg-gray-100 disabled:opacity-100 dark:disabled:bg-gray-800'
                            disabled={!enableInitialGreeting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='embedScript'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center justify-between'>
                        <div className='flex flex-col'>
                          <span className='font-bold'>埋め込みスクリプト</span>
                          <span className='text-muted-foreground mt-1 text-xs'>
                            ウェブサイトの右下にチャットバブルを追加するには、このスクリプトタグをHTMLに追加します。
                          </span>
                        </div>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={handleCopyScript}
                          className='h-8'
                        >
                          <Copy className='mr-2 h-4 w-4' />
                          コピー
                        </Button>
                      </div>
                      <FormControl>
                        <div className='border-muted-foreground/20 bg-muted/50 dark:bg-muted/30 relative rounded-md border p-4'>
                          <pre className='h-[200px] overflow-y-auto font-mono text-xs whitespace-pre-wrap'>
                            <code className='h-full overflow-y-auto'>
                              {field.value}
                            </code>
                          </pre>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className='flex items-center justify-end gap-4 pt-4'>
              <Button
                type='button'
                onClick={handleCancel}
                disabled={isLoading}
                className='h-10 w-24 text-white hover:opacity-90'
                style={{ backgroundColor: '#6B7280' }}
              >
                キャンセル
              </Button>
              {!isNew && (
                <Button
                  type='button'
                  onClick={handleDelete}
                  disabled={isLoading}
                  className='h-10 w-24 text-white hover:opacity-90'
                  style={{ backgroundColor: '#EF4444' }}
                >
                  <Trash2 className='size-4' />
                  削除
                </Button>
              )}
              <Button
                type='submit'
                disabled={isLoading}
                className='h-10 w-24 text-white hover:opacity-90'
                style={{ backgroundColor: '#3B82F6' }}
              >
                {isLoading
                  ? isNew
                    ? '作成中...'
                    : '更新中...'
                  : isNew
                    ? '作成'
                    : '更新'}
              </Button>
            </div>
          </form>
        </Form>

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title='削除の確認'
          desc='このボットを削除してもよろしいですか？この操作は元に戻せません。'
          confirmText='削除'
          cancelBtnText='キャンセル'
          destructive
          handleConfirm={handleConfirmDelete}
          isLoading={isLoading}
        />

        <ConfirmDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          title='変更を破棄しますか？'
          desc='変更を保存せずにページを離れますか？保存されていない変更は失われます。'
          confirmText='破棄'
          cancelBtnText='キャンセル'
          handleConfirm={handleConfirmCancel}
          isLoading={isLoading}
        />
      </Main>
    </>
  )
}
