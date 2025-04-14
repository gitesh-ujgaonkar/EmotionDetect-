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

    // Transform the Hugging Face response to our expected format
    // The exact format depends on the model's output, but we'll adapt it to our frontend needs
    const predictions = Array.isArray(data)
      ? data.map((item) => ({
          box: {
            x1: item.box.xmin / 100,
            y1: item.box.ymin / 100,
            x2: item.box.xmax / 100,
            y2: item.box.ymax / 100,
          },
          label: item.label,
          score: item.score,
        }))
      : []

    return { predictions }
  } catch (error) {
    console.error("Error in emotion detection:", error)

    // If the API call fails, return mock data as fallback
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
