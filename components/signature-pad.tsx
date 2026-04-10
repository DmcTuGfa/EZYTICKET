"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface SignaturePadProps {
  onChange: (value: string) => void
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)

  function setupCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    const width = canvas.offsetWidth || 320
    const height = 160
    canvas.width = width * ratio
    canvas.height = height * ratio
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.fillStyle = "#020617"
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    return { canvas, ctx }
  }

  useEffect(() => {
    setupCanvas()
  }, [])

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const configured = setupCanvas()
    const ctx = configured?.ctx
    if (!ctx) return
    drawingRef.current = true
    const point = getPoint(event)
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const ctx = canvasRef.current?.getContext("2d")
    const canvas = canvasRef.current
    if (!ctx || !canvas) return
    const point = getPoint(event)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    if (!hasSignature) setHasSignature(true)
    onChange(canvas.toDataURL("image/png"))
  }

  function stopDrawing() {
    drawingRef.current = false
    const canvas = canvasRef.current
    if (canvas && hasSignature) onChange(canvas.toDataURL("image/png"))
  }

  function clearCanvas() {
    setupCanvas()
    setHasSignature(false)
    onChange("")
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        className="w-full rounded-md border border-border bg-slate-950 touch-none"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Firma de conformidad</span>
        <Button type="button" variant="outline" size="sm" onClick={clearCanvas}>Limpiar</Button>
      </div>
    </div>
  )
}
