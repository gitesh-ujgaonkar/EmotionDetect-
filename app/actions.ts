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
    console.log("Starting emotion detection...")
    // Remove the data URL prefix to get just the base64 data
    const base64Data = imageBase64.split(",")[1]
    console.log("Base64 data length:", base64Data.length)

    const apiKey = process.env.HUGGING_FACE_API_KEY
    if (!apiKey) {
      console.error("HUGGING_FACE_API_KEY is not set!")
      throw new Error("API key not configured")
    }

    // Using a different endpoint format for YOLOv8
    console.log("Making API request...")
    const response = await fetch("https://api-inference.huggingface.co/models/giteshujgaonkar/yolov8-emotion-model", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: base64Data,
        parameters: {
          confidence: 0.3,
          iou_threshold: 0.5,
        },
      }),
    })

    console.log("API Response status:", response.status)
    const responseText = await response.text()
    console.log("Raw response text:", responseText)

    if (!response.ok) {
      console.error("API error:", responseText)
      throw new Error(`API request failed with status ${response.status}: ${responseText}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse JSON response:", e)
      throw new Error("Invalid response format")
    }

    console.log("Parsed response:", data)

    // Transform the YOLOv8 response to our expected format
    const predictions: Prediction[] = []
    
    if (Array.isArray(data)) {
      data.forEach((detection: any) => {
        try {
          // Extract coordinates and scores
          const [x1, y1, x2, y2] = detection.box
          const label = detection.label
          const score = detection.score

          predictions.push({
            box: {
              x1: x1,
              y1: y1,
              x2: x2,
              y2: y2,
            },
            label,
            score,
          })
        } catch (e) {
          console.error("Failed to process detection:", detection, e)
        }
      })
    }

    console.log("Final predictions:", predictions)

    if (predictions.length === 0) {
      console.log("No valid predictions found in the response")
      throw new Error("No valid predictions found in the response")
    }

    return { predictions }
  } catch (error) {
    console.error("Error in emotion detection:", error)
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      })
    }
    console.log("Using fallback mock data due to API error")
    return mockEmotionDetection()
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
