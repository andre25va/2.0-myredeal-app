export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import pdf from 'pdf-parse'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are a real estate contract extraction AI for MyReDeal, a transaction coordination platform. 
Extract all relevant deal information from the provided contract text.

Rules:
- Determine deal_type from context: "buy" if representing buyer, "sell" if listing/seller side, "dual" if both sides, "referral" if referral agreement
- Extract the full property address, splitting into street, city, state (2-letter), zip
- deal_amount should be the purchase/sale price as a number string without commas or dollar signs
- close_date in YYYY-MM-DD format
- Extract ALL parties mentioned: buyers, sellers, agents, lenders, title companies, escrow officers
- For each party, extract as much contact info as available
- Set confidence to "high" if most fields were clearly found, "medium" if some were inferred, "low" if contract was unclear
- In notes, mention anything important the TC should know: contingencies, special terms, deadlines, married couples needing dual signatures, trust involvement, etc.
- If you cannot determine a field, use an empty string - never guess

Return ONLY valid JSON matching the schema. No markdown, no explanation.`

const EXTRACTION_SCHEMA = `{
  "deal_type": "buy|sell|dual|referral",
  "property_address": "street address",
  "city": "city name",
  "state": "2-letter state code",
  "zip": "zip code",
  "deal_amount": "numeric string, no commas",
  "close_date": "YYYY-MM-DD format",
  "parties": [
    {
      "first_name": "",
      "last_name": "",
      "email": "",
      "phone": "",
      "role": "buyer|seller|agent|listing_agent|buyers_agent|lender|title_company",
      "is_primary": false
    }
  ],
  "confidence": "high|medium|low",
  "notes": "any important info AI noticed"
}`

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Extract text from PDF
    let pdfText: string
    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const pdfData = await pdf(buffer)
      pdfText = pdfData.text
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse PDF. Please ensure the file is a valid PDF document.' },
        { status: 400 }
      )
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { error: 'PDF appears to be empty or contains only images. Please upload a text-based PDF.' },
        { status: 400 }
      )
    }

    // Send to OpenAI for extraction
    let extracted: Record<string, unknown>
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Extract deal information from this real estate contract. Return JSON matching this schema:\n${EXTRACTION_SCHEMA}\n\nContract text:\n${pdfText}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      })

      const content = completion.choices[0]?.message?.content?.trim()
      if (!content) {
        throw new Error('Empty response from OpenAI')
      }

      // Clean potential markdown wrapping
      const jsonStr = content.replace(/^```json\s*/, '').replace(/```\s*$/, '')
      extracted = JSON.parse(jsonStr)
    } catch (err) {
      console.error('OpenAI extraction error:', err)
      return NextResponse.json(
        { error: 'AI extraction failed. Please try again or enter details manually.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: extracted })
  } catch (err) {
    console.error('Unexpected error in deal extraction:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
