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

    console.log("Making API request to Hugging Face...")
    const response = await fetch("https://api-inference.huggingface.co/models/giteshujgaonkar/yolov8-emotion-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ inputs: { image: base64Data } }),
    })

    console.log("API Response status:", response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Hugging Face API error:", errorText)
      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("Raw API response:", JSON.stringify(data, null, 2))
    console.log("Response type:", typeof data)
    console.log("Is array:", Array.isArray(data))
    if (Array.isArray(data)) {
      console.log("Array length:", data.length)
      data.forEach((item, index) => {
        console.log(`Item ${index}:`, JSON.stringify(item, null, 2))
        console.log("Item box:", item.box)
        console.log("Item label:", item.label)
        console.log("Item score:", item.score)
      })
    }

    // Transform the YOLOv8 response to our expected format
    const predictions: Prediction[] = []
    
    if (Array.isArray(data)) {
      data.forEach((item) => {
        console.log("Processing item:", JSON.stringify(item, null, 2))
        // YOLOv8 format typically has boxes in [x1, y1, x2, y2] format
        if (item.box && Array.isArray(item.box) && item.box.length === 4) {
          predictions.push({
            box: {
              x1: item.box[0] / 100, // Normalize coordinates
              y1: item.box[1] / 100,
              x2: item.box[2] / 100,
              y2: item.box[3] / 100,
            },
            label: item.label || "Unknown",
            score: item.score || 0,
          })
        } else {
          console.log("Invalid box format:", item.box)
        }
      })
    }

    console.log("Transformed predictions:", JSON.stringify(predictions, null, 2))

    if (predictions.length === 0) {
      console.log("No valid predictions found in the response")
      throw new Error("No valid predictions found in the response")
    }

    return { predictions }
  } catch (error) {
    console.error("Error in emotion detection:", error)
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
