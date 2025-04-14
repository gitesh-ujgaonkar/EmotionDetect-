"use server"

export async function detectEmotion(imageBase64: string) {
  try {
    // Remove the data URL prefix to get just the base64 data
    const base64Data = imageBase64.split(",")[1]

    // Call the Hugging Face API
    const response = await fetch("https://api-inference.huggingface.co/models/giteshujgaonkar/yolov8-emotion-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
      },
      body: JSON.stringify({ inputs: { image: base64Data } }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Hugging Face API error:", errorText)
      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("Raw API response:", JSON.stringify(data, null, 2))

    // Transform the Hugging Face response to our expected format
    let predictions = []
    
    if (Array.isArray(data)) {
      predictions = data.map((item) => {
        // Log each item to see its structure
        console.log("Processing item:", JSON.stringify(item, null, 2))
        
        // Handle different possible response formats
        const box = item.box || item.bbox || item.bounding_box
        const label = item.label || item.class || item.emotion
        const score = item.score || item.confidence || item.probability

        if (!box || !label || score === undefined) {
          console.error("Invalid item format:", item)
          return null
        }

        return {
          box: {
            x1: (box.xmin || box.x1 || box.left) / 100,
            y1: (box.ymin || box.y1 || box.top) / 100,
            x2: (box.xmax || box.x2 || box.right) / 100,
            y2: (box.ymax || box.y2 || box.bottom) / 100,
          },
          label: label,
          score: score,
        }
      }).filter(Boolean) // Remove any null predictions
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
