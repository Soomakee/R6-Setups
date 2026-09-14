import { useRef, useState } from 'react'
import { SmartImage } from './SmartImage'

interface ImageDropzoneProps {
  images: string[]
  onChange: (images: string[]) => void
  upload: (file: File) => Promise<string>
  multiple?: boolean
  label?: string
}

/** Click-to-browse or drag-and-drop image uploader with remove buttons. */
export function ImageDropzone({ images, onChange, upload, multiple = true, label = 'Add image' }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const picked = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (picked.length === 0) {
        setError('Please choose image files (png, jpg, webp...).')
        return
      }
      const ids: string[] = []
      for (const file of picked) {
        ids.push(await upload(file))
      }
      onChange(multiple ? [...images, ...ids] : ids.slice(0, 1))
    } catch (err) {
      console.error(err)
      setError('Upload failed. Please try again.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...images]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="dropzone-wrap">
      <div
        className={`dropzone ${dragging ? 'dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void handleFiles(e.dataTransfer.files)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        <div className="dropzone-plus">{busy ? '…' : '+'}</div>
        <div className="dropzone-label">{busy ? 'Uploading…' : label}</div>
        <div className="dropzone-hint">click or drag &amp; drop</div>
      </div>

      {images.length > 0 && (
        <div className="thumbs">
          {images.map((img, i) => (
            <div className="thumb" key={`${img}-${i}`}>
              <SmartImage src={img} alt={`Image ${i + 1}`} className="thumb-img" />
              <div className="thumb-actions">
                {multiple && images.length > 1 && (
                  <>
                    <button type="button" className="icon-btn" title="Move left" onClick={() => move(i, -1)} disabled={i === 0}>
                      ←
                    </button>
                    <button type="button" className="icon-btn" title="Move right" onClick={() => move(i, 1)} disabled={i === images.length - 1}>
                      →
                    </button>
                  </>
                )}
                <button type="button" className="icon-btn danger" title="Remove" onClick={() => removeAt(i)}>
                  ✕
                </button>
              </div>
              {i === 0 && multiple && images.length > 1 && <div className="thumb-cover">cover</div>}
            </div>
          ))}
        </div>
      )}

      {error && <div className="field-error">{error}</div>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  )
}
