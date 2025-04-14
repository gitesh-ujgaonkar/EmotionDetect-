"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Upload, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { detectEmotion } from "@/app/actions"
import LoadingAnimation from "@/components/loading-animation"
import ProgressBar from "@/components/progress-bar"
import EmotionDisplay from "@/components/emotion-display"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setCapturedImage(null)
      }
      reader.readAsDataURL(file)
      setResult(null)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL("image/jpeg")
        setCapturedImage(dataUrl)
        setImage(null)
        setResult(null)
      }
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "camera") {
      startCamera()
    } else {
      stopCamera()
    }
  }

  const resetState = () => {
    setImage(null)
    setCapturedImage(null)
    setResult(null)
    setLoading(false)
    setProgress(0)
  }

  const processImage = async () => {
    const imageToProcess = image || capturedImage
    if (!imageToProcess) return

    setLoading(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 15
          return newProgress > 90 ? 90 : newProgress
        })
      }, 500)

      const result = await detectEmotion(imageToProcess)

      clearInterval(progressInterval)
      setProgress(100)
      setResult(result)
    } catch (error) {
      console.error("Error processing image:", error)
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500) // Keep loading state for a moment after completion for smooth transition
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-400 bg-clip-text text-transparent">
          Emotion Detection
        </h1>
        <ModeToggle />
      </div>

      <Card className="p-6 mb-8 border-2 border-purple-500/20 shadow-lg transition-all duration-300 hover:shadow-purple-500/10">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600">
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </TabsTrigger>
            <TabsTrigger value="camera" className="data-[state=active]:bg-purple-600">
              <Camera className="mr-2 h-4 w-4" /> Use Camera
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-purple-300/50 rounded-lg p-8 transition-all hover:border-purple-500/50">
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-purple-500 mb-4" />
                  <span className="text-lg font-medium mb-2">Click to upload an image</span>
                  <span className="text-sm text-muted-foreground">or drag and drop</span>
                </div>
                <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            {image && (
              <div className="mt-4 flex justify-center">
                <img src={image || "/placeholder.svg"} alt="Uploaded" className="max-h-[400px] rounded-lg shadow-md" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="camera" className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-2xl rounded-lg overflow-hidden shadow-lg border-2 border-purple-500/20">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                  style={{ display: capturedImage ? "none" : "block" }}
                />
                {capturedImage && (
                  <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-auto" />
                )}
              </div>
              <div className="mt-4 flex gap-4">
                {!capturedImage ? (
                  <Button onClick={captureImage} className="bg-purple-600 hover:bg-purple-700">
                    <Camera className="mr-2 h-4 w-4" /> Capture
                  </Button>
                ) : (
                  <Button onClick={() => setCapturedImage(null)} variant="outline" className="border-purple-500">
                    <RefreshCw className="mr-2 h-4 w-4" /> Retake
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex flex-col gap-4">
          <Button
            onClick={processImage}
            disabled={loading || (!image && !capturedImage)}
            className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Detect Emotions
          </Button>

          {loading && (
            <div className="mt-4">
              <LoadingAnimation />
              <ProgressBar progress={progress} />
              <p className="text-center mt-2 text-sm text-muted-foreground">
                {progress < 30
                  ? "Analyzing image..."
                  : progress < 60
                    ? "Detecting faces..."
                    : progress < 90
                      ? "Identifying emotions..."
                      : "Finalizing results..."}
              </p>
            </div>
          )}
        </div>
      </Card>

      {result && !loading && (
        <EmotionDisplay imageUrl={image || capturedImage || ""} result={result} onReset={resetState} />
      )}
    </main>
  )
}
