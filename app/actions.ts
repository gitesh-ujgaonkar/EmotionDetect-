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
    // Convert base64 to blob
    const base64Data = imageBase64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    const imageFile = new File([blob], "image.jpg", { type: 'image/jpeg' });

    // Create FormData and append the file
    const formData = new FormData();
    formData.append("file", imageFile);

    // Make the API request
    const response = await fetch(
      "https://api-inference.huggingface.co/models/giteshujgaonkar/yolov8-emotion-model",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${errorText}`);
    }

    const result = await response.json();
    console.log("Raw API response:", result);

    if (!Array.isArray(result)) {
      throw new Error("Invalid response format from API");
    }

    // Transform the response to match our expected format
    const predictions = result.map((item: any) => ({
      box: {
        x1: item.box.xmin,
        y1: item.box.ymin,
        x2: item.box.xmax,
        y2: item.box.ymax,
      },
      label: item.label,
      score: item.confidence || item.score,
    }));

    if (predictions.length === 0) {
      return {
        predictions: [],
        error: "No emotions detected in the image"
      };
    }

    return { predictions, error: null };
  } catch (error) {
    console.error("Error in emotion detection:", error);
    return {
      predictions: [],
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}
