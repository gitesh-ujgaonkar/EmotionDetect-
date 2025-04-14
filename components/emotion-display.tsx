"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface EmotionDisplayProps {
  imageUrl: string
  result: any
  onReset: () => void
}

export default function EmotionDisplay({ imageUrl, result, onReset }: EmotionDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Emotion colors for bounding boxes
  const emotionColors: Record<string, string> = {
    Happy: "#4ade80",
    Sad: "#60a5fa",
    Angry: "#f87171",
    Surprised: "#fbbf24",
    Fearful: "#a78bfa",
    Disgusted: "#34d399",
    Neutral: "#94a3b8",
  }

  useEffect(() => {
    if (!canvasRef.current || !result || !imageUrl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl

    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Check if we have predictions to draw
      if (!result.predictions || result.predictions.length === 0) {
        // No faces detected
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fillRect(10, 10, 200, 40)
        ctx.fillStyle = "#9333ea"
        ctx.font = "bold 16px sans-serif"
        ctx.fillText("No emotions detected", 20, 35)
        return
      }

      // Draw bounding boxes and labels
      result.predictions.forEach((pred: any) => {
        const { x1, y1, x2, y2 } = pred.box
        const width = (x2 - x1) * canvas.width
        const height = (y2 - y1) * canvas.height
        const x = x1 * canvas.width
        const y = y1 * canvas.height

        // Get color for this emotion
        const color = emotionColors[pred.label] || "#9333ea"

        // Draw box with animation
        drawAnimatedBox(ctx, x, y, width, height, color)

        // Draw label background
        ctx.fillStyle = color
        ctx.globalAlpha = 0.8
        ctx.fillRect(x, y - 30, 120, 30)

        // Draw label text
        ctx.globalAlpha = 1
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 16px sans-serif"
        ctx.fillText(`${pred.label} ${Math.round(pred.score * 100)}%`, x + 10, y - 10)
      })
    }
  }, [imageUrl, result])

  // Function to draw animated box
  const drawAnimatedBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
  ) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 3

    // Draw the box
    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.stroke()

    // Draw corner accents
    const cornerLength = Math.min(width, height) * 0.2

    // Top-left corner
    ctx.beginPath()
    ctx.moveTo(x, y + cornerLength)
    ctx.lineTo(x, y)
    ctx.lineTo(x + cornerLength, y)
    ctx.stroke()

    // Top-right corner
    ctx.beginPath()
    ctx.moveTo(x + width - cornerLength, y)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x + width, y + cornerLength)
    ctx.stroke()

    // Bottom-right corner
    ctx.beginPath()
    ctx.moveTo(x + width, y + height - cornerLength)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x + width - cornerLength, y + height)
    ctx.stroke()

    // Bottom-left corner
    ctx.beginPath()
    ctx.moveTo(x + cornerLength, y + height)
    ctx.lineTo(x, y + height)
    ctx.lineTo(x, y + height - cornerLength)
    ctx.stroke()
  }

  return (
    <Card className="p-6 border-2 border-purple-500/20 shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-indigo-400 bg-clip-text text-transparent">
        Emotion Detection Results
      </h2>

      <div className="flex justify-center mb-6">
        <div className="max-w-full overflow-auto rounded-lg shadow-md">
          <canvas ref={canvasRef} className="max-h-[600px] w-auto" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {result.predictions.map((pred: any, index: number) => {
          const color = emotionColors[pred.label] || "#9333ea"
          return (
            <div
              key={index}
              className="px-4 py-2 rounded-full text-white font-medium flex items-center gap-2"
              style={{ backgroundColor: color }}
            >
              <span className="w-3 h-3 rounded-full bg-white/30"></span>
              <span>
                {pred.label}: {Math.round(pred.score * 100)}%
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button onClick={onReset} variant="outline" className="border-purple-500 hover:bg-purple-500/10">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Another Image
        </Button>
      </div>
    </Card>
  )
}
