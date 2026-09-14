import { useEffect, useState } from 'react'
import { resolveImageSrc, useIdbImage } from '../lib/store'

interface SmartImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallback?: React.ReactNode
}

/**
 * Renders any app image: bundled asset URLs directly, or IndexedDB
 * uploads ("idb:...") via an object URL. Falls back while loading.
 */
export function SmartImage({ src, alt, className, fallback }: SmartImageProps) {
  const isIdb = !!src && src.startsWith('idb:')
  const blobUrl = useIdbImage(isIdb ? src : null)
  const [failed, setFailed] = useState(false)
  const resolved = resolveImageSrc(isIdb ? blobUrl : src)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!resolved || failed) {
    return (
      <span className={`img-fallback ${className ?? ''}`} role="img" aria-label={alt}>
        {fallback ?? (alt || '?').slice(0, 2).toUpperCase()}
      </span>
    )
  }
  return <img className={className} src={resolved} alt={alt} draggable={false} onError={() => setFailed(true)} />
}
