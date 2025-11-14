import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DocumentsTable } from './components/documents-table'
import { documents } from './data/documents'

const route = getRouteApi('/_authenticated/chatbox/document/')

export function TrainingDocument() {
  const search = route.useSearch()
  const routeNavigate = route.useNavigate()

  const navigate: (opts: {
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
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              学習用ドキュメント
            </h2>
            <p className='text-muted-foreground'>
              ここでドキュメントを管理できます
            </p>
          </div>
        </div>
        <DocumentsTable data={documents} search={search} navigate={navigate} />
      </Main>
    </>
  )
}
