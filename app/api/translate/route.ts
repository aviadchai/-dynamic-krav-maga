import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const { fields } = await request.json() as { fields: Record<string, string> }

  const hebrewEntries = Object.entries(fields).filter(([, v]) => v?.trim())
  if (!hebrewEntries.length) return NextResponse.json({ translations: {} })

  const list = hebrewEntries.map(([k, v]) => `[${k}]: ${v}`).join('\n\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Translate the following Hebrew texts to English. Return ONLY a JSON object where keys are the field names and values are the English translations. Keep the same tone and style. Do not add explanations.

${list}

Return format: {"fieldName": "translation", ...}`,
    }],
  })

  const raw = (message.content[0] as { type: string; text: string }).text.trim()
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return NextResponse.json({ error: 'Parse error' }, { status: 500 })

  const translations = JSON.parse(jsonMatch[0])
  return NextResponse.json({ translations })
}
