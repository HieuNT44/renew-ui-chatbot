import { cn } from '@/lib/utils'

type ContentSectionProps = {
  title: string
  desc?: string
  children: React.ReactNode
  className?: string
}

export function ContentSection({
  title,
  desc,
  children,
  className,
}: ContentSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
        {desc && <p className='text-muted-foreground mt-1 text-sm'>{desc}</p>}
      </div>
      {children}
    </div>
  )
}
