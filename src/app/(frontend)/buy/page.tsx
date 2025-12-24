'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import NavigationClient from '../components/NavigationClient'
import '../styles.css'
import './buy.css'

interface Draw {
  id: string
  drawNumber: string
  drawDate: string
  round: string
  status: string
}

export default function BuyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const drawId = searchParams.get('draw')

  const [draw, setDraw] = useState<Draw | null>(null)
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [numbers, setNumbers] = useState<Array<{ number: string; betType: string }>>([
    { number: '', betType: 'straight' },
  ])
  const [amount, setAmount] = useState<number>(100)

  useEffect(() => {
    fetchDraws()
  }, [])

  useEffect(() => {
    if (drawId) {
      fetchDraw(drawId)
    }
  }, [drawId])

  const fetchDraws = async () => {
    try {
      const res = await fetch('/api/lottery-draws?where[status][equals]=pending')
      const data = await res.json()
      setDraws(data.docs || [])
      if (drawId && data.docs) {
        const selectedDraw = data.docs.find((d: Draw) => d.id === drawId)
        if (selectedDraw) {
          setDraw(selectedDraw)
        }
      }
    } catch (err) {
      console.error('Error fetching draws:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDraw = async (id: string) => {
    try {
      const res = await fetch(`/api/lottery-draws/${id}`)
      if (res.ok) {
        const data = await res.json()
        setDraw(data)
      }
    } catch (err) {
      console.error('Error fetching draw:', err)
    }
  }

  const addNumber = () => {
    if (numbers.length < 10) {
      setNumbers([...numbers, { number: '', betType: 'straight' }])
    }
  }

  const removeNumber = (index: number) => {
    setNumbers(numbers.filter((_, i) => i !== index))
  }

  const updateNumber = (index: number, field: 'number' | 'betType', value: string) => {
    const updated = [...numbers]
    updated[index] = { ...updated[index], [field]: value }
    setNumbers(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!draw) {
      setError('กรุณาเลือกงวดหวย')
      return
    }

    const validNumbers = numbers.filter((n) => n.number.length === 6 && /^\d{6}$/.test(n.number))
    if (validNumbers.length === 0) {
      setError('กรุณากรอกเลขหวยอย่างน้อย 1 เลข (6 หลัก)')
      return
    }

    if (amount < 1) {
      setError('จำนวนเงินต้องมากกว่า 0')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/lottery-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draw: draw.id,
          numbers: validNumbers,
          amount,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการซื้อหวย')
      }

      const ticket = await res.json()
      setSuccess(true)
      setTimeout(() => {
        router.push(`/my-tickets?ticket=${ticket.id}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการซื้อหวย')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="home">
        <header className="header">
          <h1>🎰 Smart Lotto</h1>
          <NavigationClient />
        </header>
        <div className="main-content">
          <div className="loading">กำลังโหลด...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      <header className="header">
        <h1>🎰 Smart Lotto</h1>
        <NavigationClient />
      </header>
      <div className="buy-page">
        <div className="page-header">
          <h1>ซื้อหวย</h1>
          <a href="/" className="back-link">
            ← กลับหน้าหลัก
          </a>
        </div>

      <div className="buy-container">
        <form onSubmit={handleSubmit} className="buy-form">
          <div className="form-group">
            <label htmlFor="draw">เลือกงวดหวย *</label>
            <select
              id="draw"
              value={draw?.id || ''}
              onChange={(e) => {
                const selectedDraw = draws.find((d) => d.id === e.target.value)
                setDraw(selectedDraw || null)
                router.push(`/buy?draw=${e.target.value}`)
              }}
              required
            >
              <option value="">-- เลือกงวดหวย --</option>
              {draws.map((d) => {
                const roundLabel =
                  d.round === 'morning'
                    ? 'รอบเช้า'
                    : d.round === 'afternoon'
                      ? 'รอบบ่าย'
                      : 'รอบเย็น'
                return (
                  <option key={d.id} value={d.id}>
                    {d.drawNumber} ({roundLabel}) -{' '}
                    {new Date(d.drawDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </option>
                )
              })}
            </select>
          </div>

          {draw && (
            <div className="draw-info">
              <h3>งวด: {draw.drawNumber}</h3>
              <p className="draw-round-info">
                <span className="round-badge">
                  {draw.round === 'morning'
                    ? 'รอบเช้า'
                    : draw.round === 'afternoon'
                      ? 'รอบบ่าย'
                      : 'รอบเย็น'}
                </span>
              </p>
              <p>
                วันที่ออกผล:{' '}
                {new Date(draw.drawDate).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          <div className="form-group">
            <label>เลขที่ซื้อ *</label>
            <div className="numbers-list">
              {numbers.map((num, index) => (
                <div key={index} className="number-input-group">
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={num.number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      updateNumber(index, 'number', value)
                    }}
                    className="number-input"
                  />
                  <select
                    value={num.betType}
                    onChange={(e) => updateNumber(index, 'betType', e.target.value)}
                    className="bet-type-select"
                  >
                    <option value="straight">เลขตรง</option>
                    <option value="running">เลขวิ่ง</option>
                    <option value="tod">เลขโต๊ด</option>
                  </select>
                  {numbers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNumber(index)}
                      className="btn-remove"
                    >
                      ลบ
                    </button>
                  )}
                </div>
              ))}
            </div>
            {numbers.length < 10 && (
              <button type="button" onClick={addNumber} className="btn-add">
                + เพิ่มเลข
              </button>
            )}
            <p className="form-hint">เลขหวยต้องเป็น 6 หลัก (0-9)</p>
          </div>

          <div className="form-group">
            <label htmlFor="amount">จำนวนเงิน (บาท) *</label>
            <input
              type="number"
              id="amount"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="amount-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">ซื้อหวยสำเร็จ! กำลังไปยังหน้าตั๋วของฉัน...</div>
          )}

          <button type="submit" disabled={submitting || !draw} className="btn-submit">
            {submitting ? 'กำลังซื้อ...' : 'ซื้อหวย'}
          </button>
        </form>
        </div>
      </div>
      <footer className="footer">
        <p>Smart Lotto - ระบบหวยออนไลน์</p>
      </footer>
    </div>
  )
}
