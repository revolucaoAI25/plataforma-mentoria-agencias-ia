import Image from 'next/image'

interface DoubleLogoProps {
  size?: number
}

export function DoubleLogo({ size = 36 }: DoubleLogoProps) {
  const s = size
  const overlap = Math.round(s * 0.35)

  return (
    <div
      className="flex items-center flex-shrink-0"
      style={{ width: s * 2 - overlap, height: s }}
    >
      {/* Revolução AI logo — behind */}
      <div
        className="rounded-full border-2 border-border bg-surface-2 overflow-hidden flex-shrink-0 absolute"
        style={{ width: s, height: s, marginLeft: s - overlap, zIndex: 1 }}
      >
        <Image
          src="/logo-revolucao.png"
          alt="Revolução AI"
          width={s}
          height={s}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Lucas photo — front */}
      <div
        className="rounded-full border-2 border-primary/40 overflow-hidden flex-shrink-0"
        style={{ width: s, height: s, zIndex: 2, position: 'relative' }}
      >
        <Image
          src="/lucas.jpg"
          alt="Lucas Magalhães"
          width={s}
          height={s}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
