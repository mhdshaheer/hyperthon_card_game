'use client'

import { useEffect, useRef, useState, MouseEvent, useCallback } from 'react'
import { ethers } from 'ethers'

type Card = {
  row: number
  col: number
  value: number
  flipped: boolean
  matched: boolean
}

export default function Demo() {
  /** WALLET **/
  const [providerAddress, setProviderAddress] = useState<string | null>(null)

  /** GAME STATE **/
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<Card[]>([])
  const [matchedCount, setMatchedCount] = useState<number>(0)
  const [elapsed, setElapsed] = useState<number>(0)
  const [moves, setMoves] = useState<number>(0)
  const [points, setPoints] = useState<number>(0)
  const [running, setRunning] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [savedPoints, setSavedPoints] = useState<number | null>(null)
  const [totalScore, setTotalScore] = useState<number>(0)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const timerRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)

  const rows = 4
  const cols = 4
  const [cardSize, setCardSize] = useState<number>(120)

  /** WALLET FUNCTIONS **/
  const connectWallet = async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return alert('MetaMask not found. Install from https://metamask.io/')
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      setProviderAddress(await signer.getAddress())
    } catch (e: unknown) {
      if (e instanceof Error) alert('Wallet connection failed: ' + e.message)
    }
  }

  const disconnectWallet = (): void => {
    setProviderAddress(null)
    alert('Wallet disconnected')
  }

  /** GAME FUNCTIONS **/
  const createCards = (): Card[] => {
    const total = rows * cols
    const vals: number[] = []
    for (let i = 1; i <= total / 2; i++) vals.push(i, i)
    vals.sort(() => Math.random() - 0.5)

    const arr: Card[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        arr.push({ value: vals.pop()!, row: r, col: c, flipped: false, matched: false })
      }
    }
    return arr
  }

  const drawCards = useCallback((): void => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    cards.forEach(card => {
      const x = card.col * cardSize
      const y = card.row * cardSize
      ctx.fillStyle = card.flipped || card.matched ? '#4CAF50' : '#555'
      ctx.fillRect(x + 6, y + 6, cardSize - 12, cardSize - 12)

      if (card.flipped || card.matched) {
        ctx.fillStyle = 'white'
        ctx.font = `${Math.floor(cardSize / 3)}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(card.value), x + cardSize / 2, y + cardSize / 2)
      }
    })
  }, [cards, cardSize])

  const getCardAt = (x: number, y: number): Card | undefined => {
    const col = Math.floor(x / cardSize)
    const row = Math.floor(y / cardSize)
    return cards.find(c => c.row === row && c.col === col)
  }

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>): void => {
    if (!running) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const card = getCardAt(x, y)
    if (!card || card.flipped || card.matched) return

    const copy = [...cards]
    const idx = copy.indexOf(card)
    copy[idx] = { ...card, flipped: true }
    setCards(copy)

    const newFlipped = [...flipped, copy[idx]]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1)
      setTimeout(() => checkMatch(newFlipped), 700)
    }
  }

  const checkMatch = (pair: Card[]): void => {
    const [a, b] = pair
    const copy = [...cards]
    if (a.value === b.value) {
      copy.forEach(c => {
        if ((c.row === a.row && c.col === a.col) || (c.row === b.row && c.col === b.col)) {
          c.matched = true
        }
      })
      setCards(copy)
      setMatchedCount(prev => prev + 2)
      const newPoints = points + 10
      setPoints(newPoints)
      setTotalScore(prev => prev + 10)

      if (matchedCount + 2 === rows * cols && !submitted) {
        stopTimer()
        setRunning(false)
        setSavedPoints(newPoints)
        setSubmitted(true)
        alert(`All cards solved! Points saved: ${newPoints}`)
      }
    } else {
      copy.forEach(c => {
        if ((c.row === a.row && c.col === a.col) || (c.row === b.row && c.col === b.col)) c.flipped = false
      })
      setCards(copy)
    }
    setFlipped([])
  }

  const resetGame = (): void => {
    stopTimer()
    setCards(createCards())
    setFlipped([])
    setMatchedCount(0)
    setMoves(0)
    setElapsed(0)
    setPoints(0)
    setRunning(false)
    setSubmitted(false)
    setSavedPoints(null)
  }

  const startGame = (): void => {
    resetGame()
    setRunning(true)
    startTimer()
  }

  const startTimer = (): void => {
    startRef.current = Date.now()
    timerRef.current = window.setInterval(() => {
      setElapsed(Number(((Date.now() - startRef.current) / 1000).toFixed(1)))
    }, 100)
  }

  const stopTimer = (): void => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
  }

  /** EFFECTS **/
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setCardSize(Math.floor(canvas.width / cols))
    resetGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => drawCards(), [drawCards])

  /** RENDER **/
  return (
    <div style={{ maxWidth: 800, margin: '24px auto', textAlign: 'center' }}>
      <h1>🎴 Memory Card Game — Demo</h1>

      {providerAddress ? (
        <div>
          Wallet: {providerAddress.slice(0, 6)}...{providerAddress.slice(-4)}{' '}
          <button style={{ ...buttonStyle, background: '#f44336' }} onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>
      ) : (
        <button style={buttonStyle} onClick={connectWallet}>
          Connect Wallet
        </button>
      )}

      <canvas
        ref={canvasRef}
        width={cols * cardSize}
        height={rows * cardSize}
        style={{ border: '2px solid #ddd', borderRadius: 12, margin: '16px 0' }}
        onClick={handleCanvasClick}
      />

      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 16 }}>Time: {elapsed}s</span>
        <span style={{ marginRight: 16 }}>Moves: {moves}</span>
        <span style={{ marginRight: 16 }}>Current Points: {points}</span>
        <span style={{ fontWeight: 'bold' }}>Total Score: {totalScore}</span>
      </div>

      <div>
        <button style={buttonStyle} onClick={startGame}>
          Start Game
        </button>
        <button
          style={{ ...buttonStyle, background: '#fff', color: '#4CAF50', border: '1px solid #4CAF50' }}
          onClick={resetGame}
        >
          Reset
        </button>
        <button
          style={{ ...buttonStyle, background: '#FFA500', marginLeft: 8 }}
          onClick={() => {
            stopTimer()
            setSavedPoints(points)
            setSubmitted(true)
            alert(`Points saved: ${points}`)
          }}
          disabled={submitted || !running}
        >
          Submit Points
        </button>
      </div>

      {savedPoints !== null && (
        <div style={{ marginTop: 16, fontWeight: 'bold' }}>Saved Points: {savedPoints}</div>
      )}
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  background: '#4CAF50',
  color: 'white',
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  margin: '4px',
}
