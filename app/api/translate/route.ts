import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function translateText(text: string): Promise<string> {
  if (!text?.trim()) return ''
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=he|en`
  const res = await fetch(url)
  const data = await res.json()
  return data?.responseData?.translatedText || text
}

export async function POST(request: Request) {
  const { fields } = await request.json() as { fields: Record<string, string> }

  const entries = Object.entries(fields).filter(([, v]) => v?.trim())
  if (!entries.length) return NextResponse.json({ translations: {} })

  const results = await Promise.all(
    entries.map(async ([key, value]) => [key, await translateText(value)])
  )

  const translations = Object.fromEntries(results)
  return NextResponse.json({ translations })
}
