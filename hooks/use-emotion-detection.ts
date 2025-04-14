import { useState, useCallback } from 'react'
import { InferenceSession, Tensor } from 'onnxruntime-web'

interface Prediction {
  box: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
  label: string
  score: number
}

interface DetectionResult {
  predictions: Prediction[]
  error: string | null
}

let session: InferenceSession | null = null

export function useEmotionDetection() {
  const [isLoading, setIsLoading] = useState(false)

  const detectEmotions = useCallback(async (imageBase64: string): Promise<DetectionResult> => {
    try {
      setIsLoading(true)

      // Load model if not loaded
      if (!session) {
        session = await InferenceSession.create('/models/emotion-detection.onnx')
      }

      // Convert base64 to image
      const img = new Image()
      img.src = imageBase64

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // Create canvas and get image data
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Draw image and get pixel data
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Preprocess image data for model
      const input = new Float32Array(img.width * img.height * 3)
      for (let i = 0; i < imageData.data.length / 4; i++) {
        input[i * 3] = imageData.data[i * 4] / 255.0     // R
        input[i * 3 + 1] = imageData.data[i * 4 + 1] / 255.0 // G
        input[i * 3 + 2] = imageData.data[i * 4 + 2] / 255.0 // B
      }

      // Create tensor
      const tensor = new Tensor('float32', input, [1, 3, img.height, img.width])

      // Run inference
      const results = await session.run({ images: tensor })

      // Process results
      const predictions: Prediction[] = []
      // TODO: Process model output based on your model's specific format

      return { predictions, error: null }
    } catch (error) {
      console.error('Error in emotion detection:', error)
      return {
        predictions: [],
        error: error instanceof Error ? error.message : "An unexpected error occurred"
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    detectEmotions,
    isLoading
  }
} 