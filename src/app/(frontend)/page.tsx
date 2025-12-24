import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import Navigation from './components/Navigation'
import './styles.css'

// Force dynamic rendering to avoid build-time Payload initialization issues
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // ดึงข้อมูลจาก Globals
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
  })

  const homePage = await payload.findGlobal({
    slug: 'home-page',
  })

  // ดึงงวดหวยที่เปิดอยู่ (pending)
  const draws = await payload.find({
    collection: 'lottery-draws',
    where: {
      status: { equals: 'pending' },
    },
    sort: 'drawDate',
    limit: 5,
  })

  // ดึงผลหวยล่าสุด
  const latestResults = await payload.find({
    collection: 'lottery-results',
    sort: '-createdAt',
    limit: 3,
    depth: 1,
  })

  const siteName = siteSettings?.siteName || 'Smart Lotto'
  const logo = siteSettings?.logo
    ? typeof siteSettings.logo === 'object' && siteSettings.logo
      ? siteSettings.logo
      : null
    : null

  return (
    <div className="home">
      <header className="header">
        <div className="header-brand">
          {logo && typeof logo === 'object' && (logo as any).url ? (
            <Image
              src={(logo as any).url}
              alt={siteName}
              width={40}
              height={40}
              className="site-logo"
            />
          ) : null}
          <h1>{siteName}</h1>
        </div>
        <Navigation />
      </header>

      <main className="main-content">
        {/* Hero Section */}
        {homePage?.showHero && (
          <section className="hero-section">
            {homePage?.heroImage &&
              typeof homePage.heroImage === 'object' &&
              (homePage.heroImage as any).url && (
                <div className="hero-image">
                  <Image
                    src={(homePage.heroImage as any).url}
                    alt={homePage.heroTitle || 'Hero'}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              )}
            <div className="hero-content">
              <h2 className="hero-title">{homePage?.heroTitle || 'เริ่มซื้อหวยวันนี้!'}</h2>
              {homePage?.heroDescription && (
                <p className="hero-description">{homePage.heroDescription}</p>
              )}
              {!user && (
                <Link href={homePage?.heroButtonLink || '/login'} className="btn-hero">
                  {homePage?.heroButtonText || 'เข้าสู่ระบบ'}
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Features Section */}
        {homePage?.showFeatures && homePage?.features && homePage.features.length > 0 && (
          <section className="features-section">
            <h2 className="section-title">ทำไมต้องเลือกเรา</h2>
            <div className="features-grid">
              {(homePage.features as any[])
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((feature: any, index: number) => (
                  <div key={index} className="feature-card">
                    {feature.icon && <div className="feature-icon">{feature.icon}</div>}
                    <h3 className="feature-title">{feature.title}</h3>
                    {feature.description && (
                      <p className="feature-description">{feature.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        <section className="section">
          <h2>งวดหวยที่เปิดอยู่</h2>
          {draws.docs.length === 0 ? (
            <p className="empty-state">ไม่มีงวดหวยที่เปิดอยู่ในขณะนี้</p>
          ) : (
            <div className="draws-grid">
              {draws.docs.map((draw) => {
                const drawDate = new Date(draw.drawDate as string)
                const roundLabels: Record<string, string> = {
                  morning: 'รอบเช้า',
                  afternoon: 'รอบบ่าย',
                  evening: 'รอบเย็น',
                }
                const roundLabel = roundLabels[draw.round as string] || draw.round
                return (
                  <div key={draw.id} className="draw-card">
                    <h3>{draw.drawNumber}</h3>
                    <p className="draw-round">
                      <span className="round-badge">{roundLabel}</span>
                    </p>
                    <p className="draw-date">
                      วันที่ออกผล:{' '}
                      {drawDate.toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="draw-status">
                      สถานะ: <span className="status-pending">รอออกผล</span>
                    </p>
                    {user && (
                      <Link href={`/buy?draw=${draw.id}`} className="btn-primary">
                        ซื้อหวย
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {latestResults.docs.length > 0 && (
          <section className="section">
            <h2>ผลหวยล่าสุด</h2>
            <div className="results-list">
              {latestResults.docs.map((result) => {
                const draw = typeof result.draw === 'object' && result.draw ? result.draw : null
                return (
                  <div key={result.id} className="result-card">
                    <h3>
                      งวด: {draw ? (draw as any).drawNumber : 'ไม่ทราบ'}
                      {draw && (draw as any).round && (
                        <span className="result-round">
                          {' '}
                          (
                          {(draw as any).round === 'morning'
                            ? 'รอบเช้า'
                            : (draw as any).round === 'afternoon'
                              ? 'รอบบ่าย'
                              : 'รอบเย็น'}
                          )
                        </span>
                      )}
                    </h3>
                    <div className="prize-numbers">
                      <div className="prize-item">
                        <span className="prize-label">รางวัลที่ 1:</span>
                        <span className="prize-number">{result.firstPrize}</span>
                      </div>
                      {result.secondPrize && result.secondPrize.length > 0 && (
                        <div className="prize-item">
                          <span className="prize-label">รางวัลที่ 2:</span>
                          <div className="prize-numbers-list">
                            {result.secondPrize.map((p: any, idx: number) => (
                              <span key={idx} className="prize-number">
                                {p.number}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.thirdPrize && result.thirdPrize.length > 0 && (
                        <div className="prize-item">
                          <span className="prize-label">รางวัลที่ 3:</span>
                          <div className="prize-numbers-list">
                            {result.thirdPrize.map((p: any, idx: number) => (
                              <span key={idx} className="prize-number">
                                {p.number}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Link href={`/results/${result.id}`} className="btn-link">
                      ดูผลเต็ม
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {!user && homePage?.showCTA && (
          <section className="section">
            <div className="cta-box">
              <h2>{homePage?.ctaTitle || 'เริ่มซื้อหวยวันนี้!'}</h2>
              <p>{homePage?.ctaDescription || 'เข้าสู่ระบบเพื่อซื้อหวยและตรวจผล'}</p>
              <Link href={homePage?.ctaButtonLink || '/login'} className="btn-primary">
                {homePage?.ctaButtonText || 'เข้าสู่ระบบ'}
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>{siteSettings?.footerText || 'Smart Lotto - ระบบหวยออนไลน์'}</p>
        {(siteSettings?.contactEmail || siteSettings?.contactPhone) && (
          <div className="footer-contact">
            {siteSettings?.contactEmail && (
              <p>
                อีเมล:{' '}
                <a href={`mailto:${siteSettings.contactEmail}`}>{siteSettings.contactEmail}</a>
              </p>
            )}
            {siteSettings?.contactPhone && (
              <p>
                โทร: <a href={`tel:${siteSettings.contactPhone}`}>{siteSettings.contactPhone}</a>
              </p>
            )}
          </div>
        )}
      </footer>
    </div>
  )
}
