// =============================================
// InterviewLens Analysis Engine
// Rule-based + Claude API (optional) analysis
// =============================================

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually',
  'so', 'right', 'okay', 'well', 'kind of', 'sort of', 'i mean', 'you see', 'honestly']

const WEAK_STARTERS = ["i don't know", "i'm not sure", "i guess", "maybe", "i think maybe",
  "probably", "i never", "i can't", "not really"]

const STRONG_INDICATORS = ["specifically", "for example", "as a result", "therefore", "consequently",
  "in my experience", "i demonstrated", "i achieved", "i led", "i implemented", "i delivered",
  "the outcome was", "this resulted in", "i measured"]

const GRAMMAR_PATTERNS = [
  { pattern: /\bi has\b/gi, issue: '"I has" → should be "I have"' },
  { pattern: /\bthey was\b/gi, issue: '"They was" → should be "they were"' },
  { pattern: /\bhe don't\b/gi, issue: '"He don\'t" → should be "he doesn\'t"' },
  { pattern: /\bshe don't\b/gi, issue: '"She don\'t" → should be "she doesn\'t"' },
  { pattern: /\bi done\b/gi, issue: '"I done" → should be "I did"' },
  { pattern: /\bmore better\b/gi, issue: '"More better" → should be "better"' },
  { pattern: /\bvery unique\b/gi, issue: '"Very unique" → unique is absolute' },
  { pattern: /\batm machine\b/gi, issue: '"ATM machine" is redundant' },
]

export function analyzeAnswer(transcript, question, durationSeconds = 0, role = 'HR') {
  if (!transcript || transcript.trim().length < 3) {
    return {
      confidence: 0, communication: 0, technical: 0,
      quality: 'Weak', qualityScore: 0,
      fillerCount: 0, fillerWords: [],
      grammarIssues: [],
      strengths: [], suggestions: ['Please provide an answer to be analyzed.'],
      wordCount: 0, speakingPace: 0,
      sentiment: 'neutral', tone: 'unclear'
    }
  }

  const text = transcript.toLowerCase().trim()
  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 3)
  const sentenceCount = Math.max(sentences.length, 1)

  // --- FILLER ANALYSIS ---
  const fillerWords = []
  let fillerCount = 0
  FILLER_WORDS.forEach(fw => {
    const regex = new RegExp(`\\b${fw}\\b`, 'gi')
    const matches = transcript.match(regex) || []
    if (matches.length > 0) {
      fillerWords.push({ word: fw, count: matches.length })
      fillerCount += matches.length
    }
  })
  const fillerRate = wordCount > 0 ? fillerCount / wordCount : 0

  // --- PACE ---
  const speakingPace = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 130

  // --- STRENGTH INDICATORS ---
  const strongCount = STRONG_INDICATORS.filter(si => text.includes(si)).length
  const weakCount = WEAK_STARTERS.filter(ws => text.includes(ws)).length

  // --- GRAMMAR ---
  const grammarIssues = []
  GRAMMAR_PATTERNS.forEach(({ pattern, issue }) => {
    if (pattern.test(transcript)) grammarIssues.push(issue)
  })

  // --- SCORES ---
  // Confidence (0-100)
  let confidence = 65
  if (fillerRate > 0.1) confidence -= 15
  else if (fillerRate > 0.05) confidence -= 8
  if (weakCount > 2) confidence -= 12
  else if (weakCount > 0) confidence -= 5
  if (strongCount >= 2) confidence += 10
  if (wordCount < 20) confidence -= 20
  else if (wordCount > 80) confidence += 8
  if (speakingPace > 180) confidence -= 10  // too fast
  else if (speakingPace < 80) confidence -= 8  // too slow
  confidence = Math.max(5, Math.min(95, confidence))

  // Communication (0-100)
  let communication = 60
  const avgSentenceLen = wordCount / sentenceCount
  if (avgSentenceLen > 8 && avgSentenceLen < 25) communication += 10  // good sentence length
  if (grammarIssues.length === 0) communication += 8
  else communication -= grammarIssues.length * 5
  if (wordCount > 50) communication += 8
  if (wordCount > 100) communication += 5
  if (text.includes('for example') || text.includes('for instance')) communication += 8
  if (sentences.length > 3) communication += 5
  communication = Math.max(5, Math.min(95, communication))

  // Technical (0-100) — checks relevance to question keywords
  let technical = 55
  const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 4)
  const relevantWords = questionWords.filter(qw => text.includes(qw))
  const relevance = questionWords.length > 0 ? relevantWords.length / questionWords.length : 0.5
  technical += Math.round(relevance * 20)
  if (strongCount >= 1) technical += 8
  if (wordCount > 60) technical += 8
  if (wordCount > 120) technical += 5
  technical = Math.max(5, Math.min(95, technical))

  // Overall quality
  const avg = (confidence + communication + technical) / 3
  let quality, qualityScore
  if (avg >= 75) { quality = 'Strong'; qualityScore = 4 }
  else if (avg >= 60) { quality = 'Good'; qualityScore = 3 }
  else if (avg >= 45) { quality = 'Average'; qualityScore = 2 }
  else { quality = 'Weak'; qualityScore = 1 }

  // Strengths
  const strengths = []
  if (fillerRate < 0.03) strengths.push('Very few filler words — clear, confident delivery')
  if (wordCount > 80) strengths.push('Detailed, thorough answer with good length')
  if (strongCount >= 2) strengths.push('Used specific examples and strong evidence language')
  if (grammarIssues.length === 0) strengths.push('Clean grammar and sentence construction')
  if (text.includes('for example') || text.includes('for instance')) strengths.push('Supported answer with concrete examples')
  if (speakingPace >= 110 && speakingPace <= 160) strengths.push('Good speaking pace — easy to follow')
  if (strengths.length === 0) strengths.push('Attempted the question with a relevant response')

  // Suggestions
  const suggestions = []
  if (fillerRate > 0.05) suggestions.push(`Reduce filler words — detected: ${fillerWords.slice(0,3).map(f => `"${f.word}" x${f.count}`).join(', ')}`)
  if (wordCount < 40) suggestions.push('Expand your answer — aim for at least 60-80 words per response')
  if (!text.includes('for example') && !text.includes('instance')) suggestions.push('Add a specific example using the STAR method (Situation, Task, Action, Result)')
  if (weakCount > 0) suggestions.push('Replace hesitant phrases like "I think maybe" or "I\'m not sure" with confident statements')
  if (speakingPace > 175) suggestions.push('Slow down slightly — you\'re speaking faster than 175 wpm')
  if (grammarIssues.length > 0) suggestions.push(`Grammar: ${grammarIssues[0]}`)
  if (technical < 55) suggestions.push('Address the question more directly — focus on what was specifically asked')
  if (suggestions.length === 0) suggestions.push('Good answer overall — practice delivering it even more fluently')

  // Tone
  let tone = 'neutral'
  if (confidence >= 75) tone = 'confident'
  else if (confidence >= 55) tone = 'composed'
  else if (weakCount > 2 || fillerRate > 0.1) tone = 'nervous'
  else tone = 'hesitant'

  return {
    confidence,
    communication,
    technical,
    quality,
    qualityScore,
    fillerCount,
    fillerWords,
    grammarIssues,
    strengths,
    suggestions,
    wordCount,
    speakingPace,
    tone,
    relevance: Math.round(relevance * 100)
  }
}

export function generateFinalReport(answers) {
  if (!answers || answers.length === 0) return null

  const scores = answers.map(a => a.analysis)
  const avgConfidence = Math.round(scores.reduce((s, a) => s + a.confidence, 0) / scores.length)
  const avgComm = Math.round(scores.reduce((s, a) => s + a.communication, 0) / scores.length)
  const avgTech = Math.round(scores.reduce((s, a) => s + a.technical, 0) / scores.length)
  const overall = Math.round((avgConfidence + avgComm + avgTech) / 3)

  let readiness
  if (overall >= 75) readiness = 'Job Ready'
  else if (overall >= 55) readiness = 'Intermediate'
  else readiness = 'Beginner'

  // Aggregate suggestions and strengths
  const allSuggestions = [...new Set(scores.flatMap(s => s.suggestions))]
  const allStrengths = [...new Set(scores.flatMap(s => s.strengths))]

  // Trend: improving, declining, steady
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
  const secondHalf = scores.slice(Math.floor(scores.length / 2))
  const firstAvg = firstHalf.reduce((s, a) => s + (a.confidence + a.communication) / 2, 0) / (firstHalf.length || 1)
  const secondAvg = secondHalf.reduce((s, a) => s + (a.confidence + a.communication) / 2, 0) / (secondHalf.length || 1)
  let trend = 'Steady'
  if (secondAvg > firstAvg + 5) trend = 'Improving'
  else if (firstAvg > secondAvg + 5) trend = 'Declining'

  // Weak areas
  const weakAreas = []
  if (avgConfidence < 60) weakAreas.push('Confidence & Delivery')
  if (avgComm < 60) weakAreas.push('Communication Clarity')
  if (avgTech < 60) weakAreas.push('Technical Depth')
  if (scores.filter(s => s.fillerCount > 5).length > scores.length / 2) weakAreas.push('Filler Word Usage')

  return {
    overall, avgConfidence, avgComm, avgTech,
    readiness, trend, weakAreas,
    topStrengths: allStrengths.slice(0, 4),
    topSuggestions: allSuggestions.slice(0, 5),
    questionCount: answers.length,
    answers
  }
}

// AI analysis via Claude (optional — falls back to rule-based)
export async function analyzeWithClaude(transcript, question, apiKey) {
  if (!apiKey) return null
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Interview question: "${question}"
Candidate answer: "${transcript}"

Analyze briefly. Return ONLY JSON:
{
  "confidence_boost": <-10 to +10 integer>,
  "communication_boost": <-10 to +10 integer>,
  "technical_boost": <-10 to +10 integer>,
  "ai_strengths": ["<strength>"],
  "ai_suggestions": ["<suggestion>"],
  "ai_tone": "<confident|composed|nervous|hesitant>",
  "ai_summary": "<1 sentence overall assessment>"
}`
        }]
      })
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}

// Transcription via Groq Whisper
export async function transcribeWithGroq(audioBlob, groqKey) {
  if (!groqKey) throw new Error('Groq API key required')
  const mimeType = audioBlob.type || 'audio/webm'
  const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm'
  const formData = new FormData()
  formData.append('file', audioBlob, 'recording.' + ext)
  formData.append('model', 'whisper-large-v3')
  formData.append('response_format', 'json')
  formData.append('language', 'en')

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + groqKey },
    body: formData
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || 'Transcription failed')
  }
  const data = await res.json()
  return data.text || ''
}
