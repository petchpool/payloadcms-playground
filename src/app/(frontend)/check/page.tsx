'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import NavigationClient from '../components/NavigationClient'
import '../styles.css'
import './check.css'

interface Ticket {
  id: string
  ticketNumber: string
  numbers: Array<{ number: string; betType: string }>
  amount: number
  status: string
  prizeAmount?: number
  draw?: any
}

interface CheckResult {
  ticket: string
  status: string
  ticketNumber: string
  checkedNumbers: Array<{
    number: string
    betType: string
    won: boolean
    prizeAmount: number
    prizeType?: string
  }>
  won: boolean
  prizeAmount: number
  result?: any
}

export default function CheckPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ticketId = searchParams.get('ticket')

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
    } else {
      setLoading(false)
    }
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/lottery-tickets/${ticketId}`)
      if (!res.ok) {
        throw new Error('ไม่พบตั๋วหวย')
      }
      const data = await res.json()
      setTicket(data)
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const checkResult = async () => {
    if (!ticket) return

    setChecking(true)
    setError(null)

    try {
      const res = await fetch(`/api/lottery-tickets/${ticket.id}/check-result`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการตรวจผล')
      }
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการตรวจผล')
    } finally {
      setChecking(false)
    }
  }

  if (loading) {
    return (
      <div className="home">
        <div className="main-content">
          <div className="loading">กำลังโหลด...</div>
        </div>
      </div>
    )
  }

  if (!ticketId || !ticket) {
    return (
      <div className="home">
        <header className="header">
          <h1>🎰 Smart Lotto</h1>
          <NavigationClient />
        </header>
        <main className="main-content">
          <div className="section">
            <h2>ตรวจผลหวย</h2>
            <p>กรุณาเลือกตั๋วหวยจากหน้าตั๋วของฉัน</p>
            <Link href="/my-tickets" className="btn-primary">
              ไปที่ตั๋วของฉัน
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const draw =
    typeof ticket.draw === 'object' && ticket.draw ? ticket.draw : null

  return (
    <div className="home">
      <header className="header">
        <h1>🎰 Smart Lotto</h1>
        <nav className="nav">
          <Link href="/">หน้าแรก</Link>
          <Link href="/buy">ซื้อหวย</Link>
          <Link href="/my-tickets">ตั๋วของฉัน</Link>
          <Link href="/results">ผลหวย</Link>
          <Link href="/check">ตรวจผล</Link>
        </nav>
      </header>

      <main className="main-content">
        <div className="check-container">
          <div className="check-header">
            <h2>ตรวจผลหวย</h2>
            <Link href="/my-tickets" className="back-link">
              ← กลับไปตั๋วของฉัน
            </Link>
          </div>

          <div className="ticket-summary">
            <h3>ข้อมูลตั๋ว</h3>
            <div className="summary-info">
              <p>
                <strong>เลขที่ตั๋ว:</strong> {ticket.ticketNumber}
              </p>
              <p>
                <strong>งวด:</strong>{' '}
                {draw ? (draw as any).drawNumber : 'ไม่ทราบ'}
              </p>
              <p>
                <strong>จำนวนเงิน:</strong> {ticket.amount} บาท
              </p>
              <p>
                <strong>สถานะ:</strong>{' '}
                <span
                  className={`status-${ticket.status}`}
                  style={{
                    color:
                      ticket.status === 'won'
                        ? 'rgb(100, 255, 100)'
                        : ticket.status === 'lost'
                          ? 'rgb(200, 200, 200)'
                          : 'rgb(255, 200, 100)',
                  }}
                >
                  {ticket.status === 'pending'
                    ? 'รอตรวจผล'
                    : ticket.status === 'won'
                      ? 'ถูกรางวัล'
                      : 'ไม่ถูกรางวัล'}
                </span>
              </p>
            </div>

            <div className="ticket-numbers-summary">
              <strong>เลขที่ซื้อ:</strong>
              <div className="numbers-list">
                {ticket.numbers?.map((num: any, idx: number) => (
                  <div key={idx} className="number-item">
                    <span className="number">{num.number}</span>
                    <span className="bet-type">
                      {num.betType === 'straight'
                        ? 'เลขตรง'
                        : num.betType === 'running'
                          ? 'เลขวิ่ง'
                          : 'เลขโต๊ด'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {ticket.status === 'pending' && (
            <div className="check-section">
              <button
                onClick={checkResult}
                disabled={checking}
                className="btn-check-result"
              >
                {checking ? 'กำลังตรวจผล...' : 'ตรวจผล'}
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {result && (
            <div className="result-section">
              <h3>ผลการตรวจ</h3>

              {result.won ? (
                <div className="result-won">
                  <div className="won-badge">🎉 ถูกรางวัล!</div>
                  <div className="prize-total">
                    เงินรางวัลรวม: {result.prizeAmount.toLocaleString()} บาท
                  </div>
                </div>
              ) : (
                <div className="result-lost">
                  <div className="lost-badge">ไม่ถูกรางวัล</div>
                  <p>ขออภัย คุณไม่ถูกรางวัลในงวดนี้</p>
                </div>
              )}

              <div className="checked-numbers">
                <h4>รายละเอียดการตรวจ</h4>
                <div className="checked-list">
                  {result.checkedNumbers.map((checked, idx) => (
                    <div
                      key={idx}
                      className={`checked-item ${checked.won ? 'won' : 'lost'}`}
                    >
                      <div className="checked-number">{checked.number}</div>
                      <div className="checked-info">
                        <span className="bet-type">
                          {checked.betType === 'straight'
                            ? 'เลขตรง'
                            : checked.betType === 'running'
                              ? 'เลขวิ่ง'
                              : 'เลขโต๊ด'}
                        </span>
                        {checked.won ? (
                          <span className="prize-info">
                            ✓ ถูกรางวัล {checked.prizeAmount.toLocaleString()} บาท
                          </span>
                        ) : (
                          <span className="no-prize">ไม่ถูกรางวัล</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {ticket.status !== 'pending' && ticket.prizeAmount && ticket.prizeAmount > 0 && (
            <div className="result-section">
              <div className="result-won">
                <div className="won-badge">🎉 ถูกรางวัล!</div>
                <div className="prize-total">
                  เงินรางวัล: {ticket.prizeAmount.toLocaleString()} บาท
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Smart Lotto - ระบบหวยออนไลน์</p>
      </footer>
    </div>
  )
}

