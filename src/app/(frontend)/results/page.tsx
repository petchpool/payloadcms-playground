import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import Navigation from '../components/Navigation'
import '../styles.css'
import './results.css'

export default async function ResultsPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // ดึงผลหวยทั้งหมด
  const results = await payload.find({
    collection: 'lottery-results',
    sort: '-createdAt',
    limit: 20,
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
          <h2>ผลหวย</h2>
        </div>

        {results.docs.length === 0 ? (
          <div className="section">
            <p className="empty-state">ยังไม่มีผลหวย</p>
          </div>
        ) : (
          <div className="results-list">
            {results.docs.map((result) => {
              const draw =
                typeof result.draw === 'object' && result.draw
                  ? result.draw
                  : null
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
              const drawDate = draw
                ? new Date((draw as any).drawDate).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'ไม่ทราบ'

              return (
                <div key={result.id} className="result-card">
                  <div className="result-header">
                    <h3>
                      งวดที่ {drawNumber}
                      {roundLabel && <span className="result-round"> ({roundLabel})</span>}
                    </h3>
                    <p className="result-date">วันที่ออกผล: {drawDate}</p>
                  </div>

                  <div className="prizes-section">
                    <div className="prize-group first-prize">
                      <h4>รางวัลที่ 1</h4>
                      <div className="prize-number-large">{result.firstPrize}</div>
                    </div>

                    {result.secondPrize && result.secondPrize.length > 0 && (
                      <div className="prize-group">
                        <h4>รางวัลที่ 2</h4>
                        <div className="prize-numbers-grid">
                          {result.secondPrize.map((p: any, idx: number) => (
                            <span key={idx} className="prize-number">
                              {p.number}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.thirdPrize && result.thirdPrize.length > 0 && (
                      <div className="prize-group">
                        <h4>รางวัลที่ 3</h4>
                        <div className="prize-numbers-grid">
                          {result.thirdPrize.map((p: any, idx: number) => (
                            <span key={idx} className="prize-number">
                              {p.number}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.fourthPrize && result.fourthPrize.length > 0 && (
                      <div className="prize-group">
                        <h4>รางวัลที่ 4</h4>
                        <div className="prize-numbers-grid">
                          {result.fourthPrize.map((p: any, idx: number) => (
                            <span key={idx} className="prize-number">
                              {p.number}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.fifthPrize && result.fifthPrize.length > 0 && (
                      <div className="prize-group">
                        <h4>รางวัลที่ 5</h4>
                        <div className="prize-numbers-grid">
                          {result.fifthPrize.map((p: any, idx: number) => (
                            <span key={idx} className="prize-number">
                              {p.number}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(result.frontThreeDigits ||
                      result.backThreeDigits ||
                      result.frontTwoDigits ||
                      result.backTwoDigits) && (
                      <div className="special-prizes">
                        {result.frontThreeDigits &&
                          result.frontThreeDigits.length > 0 && (
                            <div className="special-prize-group">
                              <h4>เลขหน้า 3 ตัว</h4>
                              <div className="prize-numbers-grid">
                                {result.frontThreeDigits.map((p: any, idx: number) => (
                                  <span key={idx} className="prize-number-small">
                                    {p.number}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {result.backThreeDigits &&
                          result.backThreeDigits.length > 0 && (
                            <div className="special-prize-group">
                              <h4>เลขหลัง 3 ตัว</h4>
                              <div className="prize-numbers-grid">
                                {result.backThreeDigits.map((p: any, idx: number) => (
                                  <span key={idx} className="prize-number-small">
                                    {p.number}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {result.frontTwoDigits &&
                          result.frontTwoDigits.length > 0 && (
                            <div className="special-prize-group">
                              <h4>เลขหน้า 2 ตัว</h4>
                              <div className="prize-numbers-grid">
                                {result.frontTwoDigits.map((p: any, idx: number) => (
                                  <span key={idx} className="prize-number-small">
                                    {p.number}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {result.backTwoDigits && result.backTwoDigits.length > 0 && (
                          <div className="special-prize-group">
                            <h4>เลขหลัง 2 ตัว</h4>
                            <div className="prize-numbers-grid">
                              {result.backTwoDigits.map((p: any, idx: number) => (
                                <span key={idx} className="prize-number-small">
                                  {p.number}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="result-footer">
                    <p className="result-time">
                      ประกาศผลเมื่อ:{' '}
                      {new Date(result.createdAt as string).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
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

