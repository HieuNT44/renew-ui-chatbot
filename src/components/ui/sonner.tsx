import { Toaster as Sonner, ToasterProps } from 'sonner'
import { useTheme } from '@/context/theme-provider'

export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group [&_[data-sonner-toast][data-type="success"]]:border-[oklch(0.6_0.15_150)] [&_[data-sonner-toast][data-type="success"]]:bg-[oklch(0.6_0.15_150)] [&_[data-sonner-toast][data-type="success"]]:text-[oklch(0.984_0.003_247.858)] [&_div[data-content]]:w-full'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
