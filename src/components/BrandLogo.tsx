import Image from 'next/image'
import logoIcon from '@/assets/logo-icon.svg'
import logoText from '@/assets/logo-text.svg'

interface BrandLogoProps {
  priority?: boolean
}

export default function BrandLogo({ priority = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Logo Icon - Always visible on all screens */}
      <Image
        src={logoIcon}
        alt="Crown & Crest"
        width={40}
        height={40}
        priority={priority}
      />
      
      {/* Logo Text - Only visible on desktop (hidden on mobile) */}
      <Image
        src={logoText}
        alt=""
        width={180}
        height={45}
        priority={priority}
        className="hidden md:block"
      />
    </div>
  )
}
