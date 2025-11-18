import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Plus, SearchIcon } from 'lucide-react'
import { DocumentsTable } from './components/documents-table'
import { documents } from './data/documents'

const route = getRouteApi('/_authenticated/chatbox/document/')

export function TrainingDocument() {
  const search = route.useSearch()
  const routeNavigate = route.useNavigate()
  const navigate = useNavigate()

  const navigateSearch: (opts: {
    search:
      | true
      | Record<string, unknown>
      | ((
          prev: Record<string, unknown>
        ) => Partial<Record<string, unknown>> | Record<string, unknown>)
    replace?: boolean
  }) => void = (opts) => {
    routeNavigate({ search: opts.search, replace: opts.replace })
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
        <div className='flex flex-col gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              学習用ドキュメント
            </h2>
            <p className='text-muted-foreground'>
              ここでドキュメントを管理できます
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='relative w-full sm:w-40 md:w-52 lg:w-64'>
              <SearchIcon
                aria-hidden='true'
                className='text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2'
                size={18}
              />
              <Input
                placeholder='検索...'
                value={(search.filter as string) ?? ''}
                onChange={(event) => {
                  navigateSearch({
                    search: (prev) => ({
                      ...prev,
                      filter: event.target.value || undefined,
                    }),
                  })
                }}
                className='bg-muted/25 h-9 ps-9 text-sm'
              />
            </div>
            <Button
              className='w-fit bg-blue-600 text-white hover:bg-blue-700'
              onClick={() => {
                navigate({
                  to: '/chatbox/document/new',
                })
              }}
            >
              <Plus className='mr-2 h-4 w-4' />
              ドキュメントを追加
            </Button>
          </div>
        </div>
        <DocumentsTable
          data={documents}
          search={search}
          navigate={navigateSearch}
        />
      </Main>
    </>
  )
}
