"use client"

import { useEffect, useRef } from "react"

export default function LoadingAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    const particles: Particle[] = []

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Particle class
    class Particle {
      x: number
      y: number
      radius: number
      color: string
      velocity: { x: number; y: number }
      life: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.radius = Math.random() * 2 + 1
        this.color = `hsl(${Math.random() * 60 + 250}, 70%, 60%)`
        this.velocity = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        }
        this.life = Math.random() * 100 + 100
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
      }

      update() {
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.life--

        if (this.radius > 0.2) {
          this.radius -= 0.01
        }

        this.draw()
      }
    }

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Create new particles
      if (Math.random() > 0.9) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        particles.push(new Particle(x, y))
      }

      // Update particles
      particles.forEach((particle, index) => {
        if (particle.life <= 0) {
          particles.splice(index, 1)
        } else {
          particle.update()
        }
      })

      // Draw connecting lines
      ctx.strokeStyle = "rgba(120, 81, 169, 0.1)"
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="w-full h-40 relative overflow-hidden rounded-lg">
      <canvas ref={canvasRef} className="w-full h-full bg-black/10 dark:bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 border-r-transparent border-b-indigo-600 border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-blue-500 border-b-transparent border-l-blue-500 animate-spin animation-delay-150"></div>
        </div>
      </div>
    </div>
  )
}
