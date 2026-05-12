'use client'
import { useState } from 'react'

export default function TestButton() {
  const [count, setCount] = useState(0)
  return (
    <div style={{ padding: 100, color: 'white', background: '#0A0A0F', minHeight: '100vh' }}>
      <h1>Button Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}
        style={{ padding: '20px 40px', fontSize: 20, cursor: 'pointer', background: '#9333EA', color: 'white', border: 'none', borderRadius: 10 }}>
        Click Me
      </button>
    </div>
  )
}
