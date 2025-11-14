import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { Route as UpdateRoute } from '@/routes/_authenticated/chatbox/document/update/$id'
import {
  Check,
  ChevronDown,
  CloudUpload,
  FileText,
  Globe,
  Info,
  LinkIcon,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ContentSection } from '@/features/settings/components/content-section'
import { documents } from '../data/documents'

const textPageSchema = z.object({
  id: z.string(),
  pageName: z.string().min(1, 'ページ名は必須です'),
  content: z.string().min(1, 'コンテンツは必須です'),
})

const documentSettingsSchema = z.object({
  name: z.string().min(1, 'ドキュメント名は必須です'),
  website: z.string().optional(),
  files: z.array(z.instanceof(File)).optional(),
  textDocumentName: z.string().optional(),
  textPages: z.array(textPageSchema).optional(),
})

type TextPage = z.infer<typeof textPageSchema>

type DetectedLink = {
  url: string
}

type CrawledPage = {
  id: string
  url: string
  content: string
  characterCount: number
  isCompleted: boolean
  isEnabled: boolean
}

// Mock data for detected links
const mockDetectedLinks = (baseUrl: string): DetectedLink[] => {
  try {
    const url = new URL(baseUrl)
    const base = `${url.protocol}//${url.host}`
    return [
      { url: `${base}/about` },
      { url: `${base}/setting` },
      { url: `${base}/faq` },
    ]
  } catch {
    return []
  }
}

// Mock data for crawled content
const mockCrawledContent = (url: string): string => {
  return `${url} からクロールされたコンテンツのサンプル

## 概要

これはデモ用のモックデータです。実際の本番環境では、サーバーサイドでのクロール実装が推奨されます。

## 主な内容

${url} に関する詳細情報がここに表示されます。

### セクション1: イントロダクション

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

### セクション2: 詳細説明

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### セクション3: まとめ

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`
}

type DocumentSettingsFormValues = z.infer<typeof documentSettingsSchema>

type FileItemProps = {
  file: File
  onRemove: () => void
}

function FileItem({ file, onRemove }: FileItemProps) {
  // Simple estimation: use file size as character count approximation
  const estimatedChars = Math.floor(file.size / 2)

  return (
    <div className='flex items-center justify-between rounded-lg border bg-gray-50 p-3 dark:bg-gray-900'>
      <div className='flex-1'>
        <p className='text-sm font-medium'>{file.name}</p>
        <p className='text-muted-foreground text-xs'>
          {estimatedChars.toLocaleString()} 文字
        </p>
      </div>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={onRemove}
        className='text-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/20'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  )
}

export function DocumentSettings() {
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = location.pathname === '/chatbox/document/new'

  // Try to get id from update route, if it exists
  let id: string | undefined
  try {
    const params = UpdateRoute.useParams()
    id = params.id
  } catch {
    // Not in update route, so it's new route
    id = undefined
  }

  const document = isNew ? undefined : documents.find((d) => d.id === id)

  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('file')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isFetchingLink, setIsFetchingLink] = useState(false)
  const [_fetchedTextCount, _setFetchedTextCount] = useState<number | null>(
    null
  )
  const [detectedLinks, setDetectedLinks] = useState<DetectedLink[]>([])
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([])
  const [openCrawledPages, setOpenCrawledPages] = useState<Set<string>>(
    new Set()
  )

  // Mock sample data based on document ID
  const getSampleData = () => {
    // If it's a new document, return empty data
    if (isNew || !document) {
      return {
        name: '',
        website: '',
        textPages: [],
      }
    }

    // Sample data based on document types
    if (document.documentTypes.includes('url')) {
      return {
        name: document.name,
        website: 'https://example.com',
        textPages: [],
      }
    }

    if (document.documentTypes.includes('text')) {
      return {
        name: document.name,
        website: '',
        textPages: [
          {
            id: '1',
            pageName: 'はじめに',
            content:
              'このドキュメントは、BOTの知識ベースとして使用される学習用コンテンツです。このセクションでは、基本的な概要と目的について説明します。',
          },
          {
            id: '2',
            pageName: '基本情報',
            content:
              '基本的な情報や手順について説明します。ここには重要な詳細情報が含まれています。',
          },
        ],
      }
    }

    // If document doesn't have text type but we're editing, add sample text pages anyway
    if (document.id) {
      return {
        name: document.name,
        website: '',
        textPages: [
          {
            id: '1',
            pageName: 'はじめに',
            content:
              'このドキュメントは、BOTの知識ベースとして使用される学習用コンテンツです。このセクションでは、基本的な概要と目的について説明します。',
          },
          {
            id: '2',
            pageName: '基本情報',
            content:
              '基本的な情報や手順について説明します。ここには重要な詳細情報が含まれています。',
          },
        ],
      }
    }

    return {
      name: document.name,
      website: '',
      textPages: [],
    }
  }

  const sampleData = getSampleData()
  const [textPages, setTextPages] = useState<TextPage[]>(sampleData.textPages)
  const [openCollapsibles, setOpenCollapsibles] = useState<Set<string>>(
    new Set(sampleData.textPages.map((p) => p.id))
  )

  const form = useForm<DocumentSettingsFormValues>({
    resolver: zodResolver(documentSettingsSchema),
    defaultValues: {
      name: sampleData.name,
      website: sampleData.website,
      files: [],
      textDocumentName: '',
      textPages: sampleData.textPages,
    },
  })

  const handleAddTextPage = () => {
    const newPage: TextPage = {
      id: Date.now().toString(),
      pageName: '',
      content: '',
    }
    const updatedPages = [...textPages, newPage]
    setTextPages(updatedPages)
    form.setValue('textPages', updatedPages)
    setOpenCollapsibles((prev) => new Set([...prev, newPage.id]))
  }

  // Initialize sample data on mount
  useEffect(() => {
    // Sync textPages from form defaultValues (already initialized in state, but ensure form is synced)
    if (sampleData.textPages.length > 0) {
      form.setValue('textPages', sampleData.textPages)
    }

    // Initialize crawled pages if document has url type
    if (document?.documentTypes.includes('url') && sampleData.website) {
      const mockCrawledPage: CrawledPage = {
        id: '1',
        url: sampleData.website,
        content:
          'これはサンプルのクロールされたコンテンツです。実際のウェブサイトから取得されたデータがここに表示されます。',
        characterCount: 50,
        isCompleted: true,
        isEnabled: true,
      }
      setCrawledPages([mockCrawledPage])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-create empty page when switching to text tab (only if no sample data)
  useEffect(() => {
    if (
      activeTab === 'text' &&
      textPages.length === 0 &&
      sampleData.textPages.length === 0
    ) {
      const newPage: TextPage = {
        id: Date.now().toString(),
        pageName: '',
        content: '',
      }
      const updatedPages = [newPage]
      setTextPages(updatedPages)
      form.setValue('textPages', updatedPages)
      setOpenCollapsibles((prev) => new Set([...prev, newPage.id]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleRemoveTextPage = (id: string) => {
    const updatedPages = textPages.filter((page) => page.id !== id)
    setTextPages(updatedPages)
    form.setValue('textPages', updatedPages)
    setOpenCollapsibles((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const handleDetectLinks = async (url: string) => {
    setIsFetchingLink(true)
    try {
      // Add main page to crawledPages with loading state
      const mainPageId = `main-${Date.now()}`
      const mainCrawledPage: CrawledPage = {
        id: mainPageId,
        url: url,
        content: '',
        characterCount: 0,
        isCompleted: false,
        isEnabled: false,
      }
      setCrawledPages((prev) => [...prev, mainCrawledPage])

      // Simulate API call to detect links and crawl main page
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const links = mockDetectedLinks(url)
      setDetectedLinks(links)

      // Update main page with crawled content
      const mainContent = mockCrawledContent(url)
      const mainCharacterCount = mainContent.length

      setCrawledPages((prev) =>
        prev.map((page) =>
          page.id === mainPageId
            ? {
                ...page,
                content: mainContent,
                characterCount: mainCharacterCount,
                isCompleted: true,
                isEnabled: true,
              }
            : page
        )
      )
      toast.success(`メインページと${links.length}個のリンクを検出しました`)
    } catch {
      toast.error('リンクの検出に失敗しました')
      // Update page to show error state
      setCrawledPages((prev) =>
        prev.map((page) =>
          page.url === url
            ? {
                ...page,
                isCompleted: true,
                isEnabled: false,
              }
            : page
        )
      )
    } finally {
      setIsFetchingLink(false)
    }
  }

  const handleCrawlLink = async (linkUrl: string) => {
    try {
      // Add page to crawledPages with loading state
      const pageId = Date.now().toString()
      const newCrawledPage: CrawledPage = {
        id: pageId,
        url: linkUrl,
        content: '',
        characterCount: 0,
        isCompleted: false,
        isEnabled: false,
      }
      setCrawledPages((prev) => [...prev, newCrawledPage])

      // Simulate API call to crawl link
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const content = mockCrawledContent(linkUrl)
      const characterCount = content.length

      // Update page with crawled content
      setCrawledPages((prev) =>
        prev.map((page) =>
          page.id === pageId
            ? {
                ...page,
                content,
                characterCount,
                isCompleted: true,
                isEnabled: true,
              }
            : page
        )
      )
      setDetectedLinks((prev) => prev.filter((link) => link.url !== linkUrl))
      toast.success('クロールが完了しました')
    } catch {
      toast.error('クロールに失敗しました')
      // Update page to show error state
      setCrawledPages((prev) =>
        prev.map((page) =>
          page.url === linkUrl
            ? {
                ...page,
                isCompleted: true,
                isEnabled: false,
              }
            : page
        )
      )
    }
  }

  const handleToggleCrawledPage = (id: string) => {
    setCrawledPages((prev) =>
      prev.map((page) =>
        page.id === id ? { ...page, isEnabled: !page.isEnabled } : page
      )
    )
  }

  const handleRemoveCrawledPage = (id: string) => {
    setCrawledPages((prev) => prev.filter((page) => page.id !== id))
    setOpenCrawledPages((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const toggleCrawledPageCollapsible = (id: string) => {
    setOpenCrawledPages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleUpdateTextPage = (
    id: string,
    field: 'pageName' | 'content',
    value: string
  ) => {
    const updatedPages = textPages.map((page) =>
      page.id === id ? { ...page, [field]: value } : page
    )
    setTextPages(updatedPages)
    form.setValue('textPages', updatedPages)
  }

  const toggleCollapsible = (id: string) => {
    setOpenCollapsibles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.name.endsWith('.pdf') ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
    )
    setUploadedFiles((prev) => [...prev, ...newFiles])
    form.setValue('files', [...uploadedFiles, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    form.setValue('files', newFiles)
  }

  const handleUpdate = async (_data: DocumentSettingsFormValues) => {
    setIsLoading(true)
    try {
      // TODO: Implement update functionality
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('ドキュメントが正常に更新されました')
      navigate({ to: '/chatbox/document' })
    } catch {
      toast.error('更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement delete functionality
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setShowDeleteDialog(false)
      toast.error('ドキュメントが正常に削除されました')
      navigate({ to: '/chatbox/document' })
    } catch {
      toast.error('削除に失敗しました')
      setShowDeleteDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = () => {
    setShowCancelDialog(false)
    navigate({ to: '/chatbox/document' })
  }

  if (!isNew && !document) {
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
            ドキュメントが見つかりませんでした
          </p>
        </Main>
      </>
    )
  }

  const sidebarNavItems = [
    {
      title: 'ファイルアップロード',
      value: 'file',
      icon: <CloudUpload size={18} />,
      contentTitle: 'ファイルアップロード',
      contentDesc: 'ファイルをアップロードしてドキュメントを作成します。',
    },
    {
      title: 'URL クローラー',
      value: 'website',
      icon: <Globe size={18} />,
      contentTitle: 'URL クローラー',
      contentDesc: 'URL からコンテンツを取得します。',
    },
    {
      title: 'テキスト入力',
      value: 'text',
      icon: <FileText size={18} />,
      contentTitle: 'テキスト入力',
      contentDesc:
        'テキストコンテンツを直接入力してドキュメントを作成します。複数のページを作成し、各ページに名前とコンテンツを設定できます。',
    },
  ]

  const activeTabItem = sidebarNavItems.find((item) => item.value === activeTab)

  return (
    <>
      <Header>
        <div className='flex items-center'>
          <span className='text-sm font-medium sm:text-base'>
            出展者ＢＯＴの管理 | 株式会社日本医工研究所
          </span>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-lg font-bold tracking-tight md:text-xl'>
            {isNew ? 'データ新規作成' : 'データ編集'}
          </h1>
        </div>
        <Separator className='my-2 lg:my-4' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 flex items-start lg:sticky lg:w-1/5'>
            <div className='mb-4 p-1 md:hidden'>
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className='h-12 w-48'>
                  <div className='flex items-center gap-2'>
                    <span className='scale-125'>
                      {
                        sidebarNavItems.find((item) => item.value === activeTab)
                          ?.icon
                      }
                    </span>
                    <SelectValue>
                      {sidebarNavItems.find((item) => item.value === activeTab)
                        ?.title || 'タブを選択'}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {sidebarNavItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <div className='flex items-center gap-x-4 px-2 py-1'>
                        <span className='scale-125'>{item.icon}</span>
                        <span className='text-md'>{item.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea
              orientation='horizontal'
              type='always'
              className='bg-background hidden w-full min-w-40 px-1 py-2 md:flex'
            >
              <nav className='flex space-x-2 py-1 lg:flex-col lg:space-y-1 lg:space-x-0'>
                {sidebarNavItems.map((item) => (
                  <Button
                    key={item.value}
                    type='button'
                    variant='ghost'
                    onClick={() => setActiveTab(item.value)}
                    className={cn(
                      'w-50 justify-start',
                      activeTab === item.value
                        ? 'bg-muted hover:bg-accent'
                        : 'hover:bg-accent hover:underline'
                    )}
                  >
                    <span className='me-2'>{item.icon}</span>
                    <span className='text-sm font-bold'>{item.title}</span>
                  </Button>
                ))}
              </nav>
            </ScrollArea>
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <ContentSection
              title={activeTabItem?.contentTitle || ''}
              desc={activeTabItem?.contentDesc || ''}
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleUpdate)}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      e.target instanceof HTMLInputElement
                    ) {
                      e.preventDefault()
                    }
                  }}
                  className='space-y-6'
                >
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <span className='mb-2 block text-sm font-bold'>
                          ドキュメント名
                        </span>
                        <FormControl>
                          <Input
                            placeholder='ドキュメント名を入力'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {activeTab === 'file' && (
                    <FormField
                      control={form.control}
                      name='files'
                      render={() => (
                        <FormItem>
                          <div className='mb-2 flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <span className='block text-sm font-bold'>
                                ファイルアップロード
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className='text-muted-foreground h-4 w-4 cursor-help' />
                                </TooltipTrigger>
                                <TooltipContent className='max-w-xs'>
                                  <div className='space-y-1 text-xs'>
                                    <p>
                                      ファイルをアップロードして、BOTの知識ベースを構築します。
                                    </p>
                                    <p>
                                      アップロードされた文書の内容は解析され、BOTが質問に答える際の参考データとして使用されます。
                                    </p>
                                    <p className='font-medium'>
                                      対応形式: PDF, DOCX, TXT
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <FormControl>
                            <div className='space-y-4'>
                              <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={cn(
                                  'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                                  isDragging
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                    : 'border-blue-300 hover:border-blue-400'
                                )}
                                onClick={() => {
                                  const input = window.document.getElementById(
                                    'file-input'
                                  ) as HTMLInputElement
                                  input?.click()
                                }}
                              >
                                <input
                                  id='file-input'
                                  type='file'
                                  accept='.pdf,.docx'
                                  multiple
                                  onChange={handleFileInputChange}
                                  className='hidden'
                                />
                                <CloudUpload className='mx-auto mb-4 h-12 w-12 text-green-400' />
                                <p className='mb-2 text-sm font-medium'>
                                  ファイルをここにドラッグアンドドロップするか、クリックしてファイルを選択してください
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                  サポートされているファイル形式: .PDF、.DOCX
                                </p>
                              </div>

                              {uploadedFiles.length > 0 && (
                                <div className='space-y-2'>
                                  {uploadedFiles.map((file, index) => (
                                    <FileItem
                                      key={index}
                                      file={file}
                                      onRemove={() => handleRemoveFile(index)}
                                    />
                                  ))}
                                </div>
                              )}
                              <div className='flex items-center justify-end'>
                                {uploadedFiles.length > 0 && (
                                  <div className='flex items-center gap-2 text-sm'>
                                    <span className='font-medium'>
                                      ファイル数: {uploadedFiles.length}
                                    </span>
                                    <span className='text-muted-foreground'>
                                      |
                                    </span>
                                    <span className='text-muted-foreground text-xs'>
                                      検出された文字数:{' '}
                                      {uploadedFiles
                                        .reduce((sum, file) => {
                                          const estimated = Math.floor(
                                            file.size / 2
                                          )
                                          return sum + estimated
                                        }, 0)
                                        .toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {activeTab === 'website' && (
                    <FormField
                      control={form.control}
                      name='website'
                      render={({ field }) => (
                        <FormItem>
                          <div className='mb-2 flex flex-col gap-1'>
                            <div className='flex items-center justify-between gap-2'>
                              <span className='block text-sm font-bold'>
                                ウェブサイト
                              </span>
                            </div>
                            <span className='text-muted-foreground text-xs'>
                              複数のURLを連続して追加できます。クロールは自動的にバックグラウンドで実行されます。（デモモード:
                              サンプルデータを生成します）
                            </span>
                          </div>
                          <FormControl>
                            <div className='flex items-center gap-2'>
                              <Input
                                placeholder='https://example.com'
                                className='flex-1 rounded-md'
                                {...field}
                              />
                              <Button
                                type='button'
                                className='rounded-md bg-blue-600 text-white hover:bg-blue-700'
                                disabled={
                                  !field.value ||
                                  field.value.trim() === '' ||
                                  isFetchingLink ||
                                  crawledPages.some(
                                    (page) =>
                                      field.value &&
                                      page.url === field.value.trim()
                                  )
                                }
                                onClick={async () => {
                                  if (field.value) {
                                    await handleDetectLinks(field.value)
                                  }
                                }}
                              >
                                {isFetchingLink ? (
                                  <>
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                    取得中...
                                  </>
                                ) : (
                                  'リンクから取得'
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />

                          {/* Detected Links Section */}
                          {detectedLinks.length > 0 && (
                            <div className='mt-4 space-y-2 rounded-lg border p-4'>
                              <div className='flex items-center gap-2'>
                                <LinkIcon className='text-muted-foreground h-4 w-4' />
                                <span className='text-sm font-bold'>
                                  検出されたリンク（クリックして追加）
                                </span>
                              </div>
                              <div className='flex flex-wrap gap-2'>
                                {detectedLinks.map((link, index) => (
                                  <Button
                                    key={index}
                                    type='button'
                                    variant='outline'
                                    onClick={() => handleCrawlLink(link.url)}
                                    className='h-auto rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100 hover:text-blue-800'
                                  >
                                    {link.url}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Crawled Pages Section */}
                          {crawledPages.length > 0 && (
                            <div className='mt-4 space-y-4'>
                              <div className='mb-2'>
                                <span className='text-sm font-bold'>
                                  クロールされたページ
                                </span>
                              </div>
                              {crawledPages.map((page) => (
                                <Collapsible
                                  key={page.id}
                                  open={openCrawledPages.has(page.id)}
                                  onOpenChange={() =>
                                    toggleCrawledPageCollapsible(page.id)
                                  }
                                >
                                  <div className='rounded-lg border'>
                                    <CollapsibleTrigger className='bg-muted/50 hover:bg-muted/50 flex w-full items-center justify-between p-4'>
                                      <div className='flex items-center gap-2'>
                                        <ChevronDown
                                          className={cn(
                                            'h-4 w-4 transition-transform',
                                            openCrawledPages.has(page.id) &&
                                              'rotate-180'
                                          )}
                                        />
                                        <span className='text-sm font-medium'>
                                          {page.url}
                                        </span>
                                      </div>
                                      <div className='flex items-center gap-2'>
                                        {!page.isCompleted ? (
                                          <div className='bg-primary/10 flex items-center gap-1 rounded-full px-2 py-1'>
                                            <Loader2 className='text-primary h-3 w-3 animate-spin' />
                                            <span className='text-primary text-xs font-medium'>
                                              クロール中...
                                            </span>
                                          </div>
                                        ) : (
                                          <div className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 dark:bg-green-900/30'>
                                            <Check className='h-3 w-3 text-green-700 dark:text-green-400' />
                                            <span className='text-xs font-medium text-green-700 dark:text-green-400'>
                                              完了 (
                                              {page.characterCount.toLocaleString()}
                                              文字)
                                            </span>
                                          </div>
                                        )}
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <Switch
                                                checked={page.isEnabled}
                                                onCheckedChange={() =>
                                                  handleToggleCrawledPage(
                                                    page.id
                                                  )
                                                }
                                                disabled={!page.isCompleted}
                                              />
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className='text-xs'>
                                              {!page.isCompleted
                                                ? 'クロール中...'
                                                : page.isEnabled
                                                  ? 'このページを無効にする'
                                                  : 'このページを有効にする'}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <Button
                                          type='button'
                                          variant='ghost'
                                          size='icon'
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemoveCrawledPage(page.id)
                                          }}
                                          disabled={!page.isCompleted}
                                          className='text-destructive hover:bg-destructive/10 h-8 w-8 disabled:opacity-50'
                                        >
                                          <Trash2 className='h-4 w-4' />
                                        </Button>
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className='p-4'>
                                      {!page.isCompleted ? (
                                        <div className='flex min-h-64 items-center justify-center'>
                                          <div className='flex flex-col items-center gap-2'>
                                            <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
                                            <span className='text-muted-foreground text-sm'>
                                              コンテンツを取得中...
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <Textarea
                                          value={page.content}
                                          readOnly
                                          className='bg-muted/50 min-h-64 resize-none'
                                        />
                                      )}
                                    </CollapsibleContent>
                                  </div>
                                </Collapsible>
                              ))}
                              {crawledPages.length > 0 && (
                                <div className='flex items-center justify-end'>
                                  <span className='text-muted-foreground text-sm font-medium'>
                                    合計:{' '}
                                    {
                                      crawledPages.filter((p) => p.isEnabled)
                                        .length
                                    }
                                    ページ /{' '}
                                    {crawledPages
                                      .filter((p) => p.isEnabled)
                                      .reduce(
                                        (sum, page) =>
                                          sum + page.characterCount,
                                        0
                                      )
                                      .toLocaleString()}
                                    文字
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  )}

                  {activeTab === 'text' && (
                    <>
                      <div className='space-y-4'>
                        <div className='mb-2 flex items-center gap-2'>
                          <span className='block text-sm font-bold'>
                            コンテンツ
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className='text-muted-foreground h-4 w-4 cursor-help' />
                            </TooltipTrigger>
                            <TooltipContent className='max-w-xs'>
                              <div className='space-y-1 text-xs'>
                                <p>
                                  複数のページを作成し、各ページに名前とコンテンツを設定できます。
                                </p>
                                <p>
                                  各ページのコンテンツは、BOTの知識ベースとして使用され、質問への回答に活用されます。
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {textPages.map((page) => (
                          <Collapsible
                            key={page.id}
                            open={openCollapsibles.has(page.id)}
                            onOpenChange={() => toggleCollapsible(page.id)}
                          >
                            <div className='rounded-lg border'>
                              <CollapsibleTrigger className='hover:bg-muted/50 flex w-full items-center justify-between p-4'>
                                <div className='flex items-center gap-2'>
                                  <span className='font-medium'>
                                    {page.pageName
                                      ? `${page.pageName}ページ`
                                      : '新しいページ'}
                                  </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveTextPage(page.id)
                                    }}
                                    className='text-destructive hover:bg-destructive/10 h-8 w-8'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                  <ChevronDown
                                    className={cn(
                                      'h-4 w-4 transition-transform',
                                      openCollapsibles.has(page.id) &&
                                        'rotate-180'
                                    )}
                                  />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className='px-4 pb-4'>
                                <div className='space-y-4 pt-2'>
                                  <div>
                                    <span className='mb-2 block text-sm font-medium'>
                                      ページ名
                                    </span>
                                    <Input
                                      placeholder='ページ名を入力'
                                      value={page.pageName}
                                      onChange={(e) =>
                                        handleUpdateTextPage(
                                          page.id,
                                          'pageName',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <span className='mb-2 block text-sm font-medium'>
                                      コンテンツ
                                    </span>
                                    <Textarea
                                      placeholder='コンテンツを入力'
                                      value={page.content}
                                      onChange={(e) =>
                                        handleUpdateTextPage(
                                          page.id,
                                          'content',
                                          e.target.value
                                        )
                                      }
                                      className='min-h-32'
                                    />
                                    <div className='mt-2 flex items-center justify-end'>
                                      <span className='text-muted-foreground text-xs'>
                                        検出された文字数:{' '}
                                        {page.content?.length?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        ))}
                        {textPages.length > 0 && (
                          <div className='flex items-center justify-end'>
                            <span className='text-muted-foreground text-sm font-medium'>
                              全ページの合計文字数:{' '}
                              {textPages
                                .reduce(
                                  (sum, page) =>
                                    sum + (page.content?.length || 0),
                                  0
                                )
                                .toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className='flex items-center justify-center'>
                          <Button
                            type='button'
                            onClick={handleAddTextPage}
                            className='w-fit'
                          >
                            <Plus className='size-4' />
                            ページを追加
                          </Button>
                        </div>
                      </div>
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
            </ContentSection>
          </div>
        </div>

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title='削除の確認'
          desc='このドキュメントを削除してもよろしいですか？この操作は元に戻せません。'
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
