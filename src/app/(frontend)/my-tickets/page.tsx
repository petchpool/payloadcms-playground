import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import Navigation from '../components/Navigation'
import '../styles.css'
import './my-tickets.css'

export default async function MyTicketsPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    return (
      <div className="home">
        <div className="main-content">
          <div className="section">
            <h2>กรุณาเข้าสู่ระบบ</h2>
            <p>คุณต้องเข้าสู่ระบบเพื่อดูตั๋วของคุณ</p>
            <Link href="/api/users/login" className="btn-primary">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ดึงตั๋วของผู้ใช้
  const tickets = await payload.find({
    collection: 'lottery-tickets',
    where: {
      user: { equals: user.id },
    },
    sort: '-createdAt',
    limit: 50,
    depth: 1,
  })

  return (
    <div className="home">
      <header className="header">
        <h1>🎰 Smart Lotto</h1>
        <Navigation />
      </header>

      <main className="main-content">
        <div className="page-header">
          <h2>ตั๋วของฉัน</h2>
          <Link href="/buy" className="btn-primary">
            ซื้อหวยใหม่
          </Link>
        </div>

        {tickets.docs.length === 0 ? (
          <div className="section">
            <p className="empty-state">คุณยังไม่มีตั๋วหวย</p>
            <Link href="/buy" className="btn-primary">
              ซื้อหวยครั้งแรก
            </Link>
          </div>
        ) : (
          <div className="tickets-grid">
            {tickets.docs.map((ticket) => {
              const draw = typeof ticket.draw === 'object' && ticket.draw ? ticket.draw : null
              const drawNumber = draw ? (draw as any).drawNumber : 'ไม่ทราบ'
              const drawRound = draw ? (draw as any).round : null
              const roundLabel =
                drawRound === 'morning'
                  ? 'รอบเช้า'
                  : drawRound === 'afternoon'
                    ? 'รอบบ่าย'
                    : drawRound === 'evening'
                      ? 'รอบเย็น'
                      : ''
              const statusColors: Record<string, string> = {
                pending: 'rgb(255, 200, 100)',
                won: 'rgb(100, 255, 100)',
                lost: 'rgb(200, 200, 200)',
                cancelled: 'rgb(255, 100, 100)',
              }
              const statusLabels: Record<string, string> = {
                pending: 'รอตรวจผล',
                won: 'ถูกรางวัล',
                lost: 'ไม่ถูกรางวัล',
                cancelled: 'ยกเลิก',
              }

              return (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <h3>ตั๋วเลขที่: {ticket.ticketNumber}</h3>
                    <span
                      className="ticket-status"
                      style={{ color: statusColors[ticket.status as string] }}
                    >
                      {statusLabels[ticket.status as string]}
                    </span>
                  </div>

                  <div className="ticket-info">
                    <p>
                      <strong>งวด:</strong> {drawNumber}
                      {roundLabel && <span className="ticket-round"> ({roundLabel})</span>}
                    </p>
                    <p>
                      <strong>จำนวนเงิน:</strong> {ticket.amount} บาท
                    </p>
                    {ticket.prizeAmount && ticket.prizeAmount > 0 && (
                      <p className="prize-amount">
                        <strong>เงินรางวัล:</strong> {ticket.prizeAmount.toLocaleString()} บาท
                      </p>
                    )}
                    <p>
                      <strong>วันที่ซื้อ:</strong>{' '}
                      {new Date(ticket.createdAt as string).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="ticket-numbers">
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

                  {ticket.status === 'pending' && (
                    <Link href={`/check?ticket=${ticket.id}`} className="btn-check">
                      ตรวจผล
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Smart Lotto - ระบบหวยออนไลน์</p>
      </footer>
    </div>
  )
}
