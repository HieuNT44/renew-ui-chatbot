import { cn } from '@/lib/utils'

type ContentSectionProps = {
  title: string
  desc?: string
  children: React.ReactNode
  className?: string
}

export function ContentSection({
  desc,
  children,
  className,
}: ContentSectionProps) {
  return (
    <div className={cn('mt-2 space-y-3', className)}>
      {desc && (
        <div className='flex items-center'>
          <p className='text-muted-foreground text-xs'>※{desc}</p>
        </div>
      )}
      {children}
    </div>
  )
}
