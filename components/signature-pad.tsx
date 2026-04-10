"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface SignaturePadProps {
  value?: string
  onChange: (value: string) => void
}

export function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const [hasSignature, setHasSignature] = useState(Boolean(value))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const ratio = window.devicePixelRatio || 1
    const width = canvas.offsetWidth || 500
    const height = canvas.offsetHeight || 220
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#111827"
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, width, height)
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
      }
      img.src = value
    }
  }, [value])

  const getPoint = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ("touches" in event) {
      const touch = event.touches[0] || event.changedTouches[0]
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    }
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const start = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const point = getPoint(event)
    drawing.current = true
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  const move = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const point = getPoint(event)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    setHasSignature(true)
  }

  const finish = () => {
    if (!drawing.current) return
    drawing.current = false
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL("image/png")
    onChange(dataUrl)
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const width = canvas.width / (window.devicePixelRatio || 1)
    const height = canvas.height / (window.devicePixelRatio || 1)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)
    setHasSignature(false)
    onChange("")
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-border bg-white p-2">
        <canvas
          ref={canvasRef}
          className="block h-52 w-full rounded-md bg-white touch-none"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={finish}
          onMouseLeave={finish}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={finish}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Firma dentro del recuadro blanco. En celular usa el dedo. En computadora usa el mouse.
        </p>
        <Button type="button" variant="outline" onClick={clear}>
          Limpiar firma
        </Button>
      </div>
      {!hasSignature && <p className="text-xs text-destructive">La firma es obligatoria para cerrar.</p>}
    </div>
  )
}
