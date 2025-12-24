'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import NavigationClient from '../components/NavigationClient'
import '../styles.css'
import './login.css'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ตรวจสอบว่ามี user login อยู่แล้วหรือไม่
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/users/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            // ถ้า login อยู่แล้ว redirect ไปหน้าแรก
            router.push(redirectTo)
          }
        }
      } catch (error) {
        // ไม่มี user login
      }
    }
    checkAuth()
  }, [router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
      }

      if (data.user) {
        setSuccess(true)
        // Redirect หลังจาก login สำเร็จ
        setTimeout(() => {
          router.push(redirectTo)
          router.refresh()
        }, 500)
      } else {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
      setLoading(false)
    }
  }

  return (
    <div className="home">
      <header className="header">
        <h1>🎰 Smart Lotto</h1>
        <NavigationClient />
      </header>

      <main className="main-content">
        <div className="login-container">
          <div className="login-card">
            <h2>เข้าสู่ระบบ</h2>
            <p className="login-subtitle">กรุณาเข้าสู่ระบบเพื่อซื้อหวยและตรวจผล</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">อีเมล</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">รหัสผ่าน</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && (
                <div className="success-message">เข้าสู่ระบบสำเร็จ! กำลังไปยังหน้าหลัก...</div>
              )}

              <button type="submit" disabled={loading || success} className="btn-login">
                {loading ? 'กำลังเข้าสู่ระบบ...' : success ? 'สำเร็จ!' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                ยังไม่มีบัญชี?{' '}
                <Link href="/register" className="link-register">
                  สมัครสมาชิก
                </Link>
              </p>
              <p>
                <Link href="/forgot-password" className="link-forgot">
                  ลืมรหัสผ่าน?
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>Smart Lotto - ระบบหวยออนไลน์</p>
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="home">
        <header className="header">
          <h1>🎰 Smart Lotto</h1>
          <NavigationClient />
        </header>
        <main className="main-content">
          <div className="loading">กำลังโหลด...</div>
        </main>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}

