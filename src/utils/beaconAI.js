// Haven AI client — Gemini 2.5 Flash Lite with thinking disabled.
// 98% cheaper than 2.5-flash with thinking. Still produces structured JSON.

const GEMINI_KEY = 'AIzaSyBFet4KSxQpLiPm6hit8yarZK0-dM2QwzU'
const MODEL = 'gemini-2.5-flash-lite'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`

// Cap response sizes so QR codes stay scannable and bills stay tiny.
const MAX_OUTPUT_TOKENS = 1200

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    urgentTonight: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' }, address: { type: 'string' },
          phone: { type: 'string' }, why: { type: 'string' },
        },
        required: ['name', 'address'],
      },
    },
    benefits: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          program: { type: 'string' }, agency: { type: 'string' },
          how: { type: 'string' }, eligibility: { type: 'string' },
        },
        required: ['program', 'agency'],
      },
    },
    health: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' }, address: { type: 'string' },
          phone: { type: 'string' }, why: { type: 'string' },
        },
        required: ['name'],
      },
    },
    housing: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' }, eligibility: { type: 'string' },
          contact: { type: 'string' }, how: { type: 'string' },
        },
        required: ['name'],
      },
    },
    food: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' }, address: { type: 'string' }, hours: { type: 'string' },
        },
        required: ['name'],
      },
    },
  },
  required: ['summary', 'urgentTonight', 'benefits', 'health', 'housing'],
}

const TIMELINE_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      day: { type: 'integer' },
      title: { type: 'string' },
      description: { type: 'string' },
      category: { type: 'string', enum: ['shelter', 'benefits', 'housing', 'legal', 'health', 'food'] },
      address: { type: 'string' },
      phone: { type: 'string' },
    },
    required: ['day', 'title', 'description', 'category'],
  },
}

const SYSTEM_PROMPT_HOMELESS = `You are Haven, an emergency resource navigator for Boston, Massachusetts.
The user is unhoused, displaced, or in crisis. They are asking for help in plain language.

Generate a real, immediately-actionable plan using REAL Boston resources.

Use these REAL Boston programs (only suggest others if you are certain they exist locally):
- Massachusetts DHCD Emergency Assistance Hotline: 1-866-584-0653
- Pine Street Inn (444 Harrison Ave): emergency men's shelter
- Rosie's Place (889 Harrison Ave): women's shelter
- Bridge Over Troubled Waters (47 West St): youth shelter
- Department of Transitional Assistance (DTA): SNAP, TAFDC, EAEDC. DTAConnect.com or 1-877-382-2363
- MassHealth: 1-800-841-2900
- WIC: 1-800-WIC-1007
- Boston Medical Center (840 Harrison Ave): hospital + behavioral health
- Boston Health Care for the Homeless Program (780 Albany St): free medical care
- Metro Housing Boston (617-425-6700): RAFT, eviction prevention
- Boston Housing Authority (617-988-3400): public housing, Section 8
- SAMHSA Helpline: 1-800-662-4357
- 211 Massachusetts: dial 211

Match resources to family size, neighborhood, and urgency. Output ONLY valid JSON.
Keep each item brief (under 40 words for descriptions).`

async function geminiCall({ prompt, schema, temperature = 0.3 }) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      // CRITICAL: disable "thinking" to avoid 2400+ extra tokens per call
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Haven AI (${res.status}): ${errText.slice(0, 160)}`)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Haven AI returned no content')
  return text
}

export async function generateHomelessPlan(situation) {
  const prompt = `${SYSTEM_PROMPT_HOMELESS}

USER SITUATION: ${situation}

Return JSON: urgentTonight (1-3 items: shelter, hotline), benefits (2-4 items: SNAP/MassHealth/WIC/RAFT), health (2-3 items: clinic, mental health), housing (2-3 items: long-term programs), food (1-3 items: food banks). Real addresses, real phone numbers. 1-2 sentence summary.`

  const text = await geminiCall({ prompt, schema: PLAN_SCHEMA, temperature: 0.4 })
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Haven AI returned malformed JSON')
  }
}

export async function generateTimeline(plan, situation) {
  const prompt = `You are Haven. Restructure this Boston resource plan as a JSON ARRAY (not object) of 8-12 timeline items spanning 90 days.

PLAN: ${JSON.stringify(plan).slice(0, 1500)}

USER SITUATION: ${situation.slice(0, 200)}

Each item: { day: integer (1-90), title: string, description: string (one short sentence), category: 'shelter'|'benefits'|'housing'|'legal'|'health'|'food', address: string (optional), phone: string (optional) }

Sequence: Day 1-2 most urgent survival, Day 3-7 benefit applications, Day 8-21 health intake + ID recovery, Day 22-60 housing applications, Day 61-90 follow-ups.

Return ONLY the JSON array.`

  try {
    const text = await geminiCall({ prompt, schema: TIMELINE_SCHEMA, temperature: 0.3 })
    const arr = JSON.parse(text)
    return Array.isArray(arr) ? arr.sort((a, b) => a.day - b.day) : []
  } catch {
    return []
  }
}
