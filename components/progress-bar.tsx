"use client"

import { useEffect, useState } from "react"

interface ProgressBarProps {
  progress: number
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    // Smooth animation for progress updates
    const animateProgress = () => {
      if (displayProgress < progress) {
        setDisplayProgress((prev) => {
          const increment = (progress - prev) * 0.1
          return Math.min(prev + increment, progress)
        })
      }
    }

    const interval = setInterval(animateProgress, 16)
    return () => clearInterval(interval)
  }, [progress, displayProgress])

  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-4">
      <div
        className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${displayProgress}%` }}
      />
    </div>
  )
}
