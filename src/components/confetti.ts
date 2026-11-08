import confetti from 'canvas-confetti'

const PALETTE = ['#E9B8C7', '#D6B783', '#FFF8F3', '#9A3A62']

export function burst(origin: { x: number; y: number } = { x: 0.5, y: 0.6 }) {
  void confetti({
    particleCount: 80,
    spread: 75,
    startVelocity: 38,
    origin,
    colors: PALETTE,
    disableForReducedMotion: true,
    zIndex: 60,
  })
}

export function heartRain() {
  const end = Date.now() + 1800
  const heart = confetti.shapeFromText({ text: '❤️', scalar: 2 })
  const frame = () => {
    void confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: PALETTE,
      shapes: [heart, 'circle'],
      scalar: 1.4,
      zIndex: 60,
    })
    void confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: PALETTE,
      shapes: [heart, 'circle'],
      scalar: 1.4,
      zIndex: 60,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}
