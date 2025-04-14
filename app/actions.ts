"use server"

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

export async function detectEmotion(imageBase64: string) {
  try {
    console.log("Starting emotion detection with YOLOv8...")

    // Call our local YOLOv8 endpoint
    const response = await fetch("/api/detect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageBase64,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Detection failed: ${errorText}`)
    }

    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }

    if (!result.predictions || result.predictions.length === 0) {
      throw new Error("No emotions detected in the image. Please try with a different image.")
    }

    return result
  } catch (error) {
    console.error("Error in emotion detection:", error)
    return {
      predictions: [],
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    }
  }
}

// Mock function to simulate API response (used as fallback)
function mockEmotionDetection() {
  return {
    predictions: [
      {
        box: { x1: 0.2, y1: 0.15, x2: 0.8, y2: 0.85 },
        label: "Happy",
        score: 0.92,
      },
      {
        box: { x1: 0.1, y1: 0.3, x2: 0.3, y2: 0.6 },
        label: "Surprised",
        score: 0.78,
      },
    ],
  }
}
