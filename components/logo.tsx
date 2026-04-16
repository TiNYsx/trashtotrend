import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  variant?: 'chrome' | 'symbol' | 'full'
}

export function Logo({ size = 'md', showText = true, variant = 'full' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg', padding: 'gap-2' },
    md: { icon: 48, text: 'text-xl', padding: 'gap-3' },
    lg: { icon: 64, text: 'text-2xl', padding: 'gap-3' },
    xl: { icon: 96, text: 'text-4xl', padding: 'gap-4' },
  }

  const { icon, text, padding } = sizes[size]

  if (variant === 'symbol') {
    return (
      <div className="relative" style={{ width: icon, height: icon }}>
        <Image
          src="/images/Hoop 1.png"
          alt="HOOP Logo"
          width={icon}
          height={icon}
          className="object-contain"
          priority
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center ${padding}`}>
      <div className="relative" style={{ width: icon, height: icon }}>
        <Image
          src="/images/Hoop 1.png"
          alt="HOOP Logo"
          width={icon}
          height={icon}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`font-display font-bold ${text} chrome-text`}>
          HOOP
        </span>
      )}
    </div>
  )
}

export function HoopSymbol({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src="/images/Hoop 1.png"
        alt="HOOP"
        width={size}
        height={size}
        className={`object-contain ${className}`}
      />
    </div>
  )
}

export function HoopFrame({ className = '' }: { className?: string }) {
  return (
    <div className="relative">
      <Image
        src="/images/frame sQ Chrome.png"
        alt="HOOP Frame"
        width={400}
        height={400}
        className={`object-contain ${className}`}
      />
    </div>
  )
}
