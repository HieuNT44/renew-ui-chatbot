type ContentSectionProps = {
  title: string
  desc?: string
  children: React.ReactNode
}

export function ContentSection({ title, desc, children }: ContentSectionProps) {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
        {desc && <p className='text-muted-foreground mt-1 text-sm'>{desc}</p>}
      </div>
      {children}
    </div>
  )
}
