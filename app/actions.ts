"use client"

import { useEmotionDetection } from "@/hooks/use-emotion-detection"

export function useEmotionDetector() {
  const { detectEmotions, isLoading } = useEmotionDetection()
  
  return {
    detectEmotions,
    isLoading
  }
}
