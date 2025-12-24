import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export async function generateMetadata() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
    })

    return {
      title: siteSettings?.siteName || 'Smart Lotto',
      description: siteSettings?.siteDescription || 'ระบบหวยออนไลน์',
    }
  } catch {
    return {
      title: 'Smart Lotto',
      description: 'ระบบหวยออนไลน์',
    }
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  let siteSettings: any = null
  try {
    siteSettings = await payload.findGlobal({
      slug: 'site-settings',
    })
  } catch {
    // Fallback if global doesn't exist yet
  }

  const siteName = siteSettings?.siteName || 'Smart Lotto'
  const favicon = siteSettings?.favicon
    ? typeof siteSettings.favicon === 'object' && siteSettings.favicon
      ? (siteSettings.favicon as any).url
      : null
    : null

  return (
    <html lang="th">
      <head>{favicon && <link rel="icon" href={favicon} />}</head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
