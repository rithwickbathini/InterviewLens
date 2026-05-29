import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Card, Button, Alert, QualityBadge, ProgressBar, Spinner } from '../components/ui/Components'
import { getQuestions, getFollowUp } from '../data/questions'
import { analyzeAnswer, analyzeWithClaude, generateFinalReport } from '../utils/analysis'
import useRecorder from '../hooks/useRecorder'
import '../styles/components.css'

export default function InterviewRoom() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const setup = state.currentSetup
  const mode = setup?.mode || 'text'
  const isPractice = setup?.style !== 'simulation'

  // Questions
  const [questions, setQuestions] = useState([])
  const [qIndex, setQIndex] = useState(0)
  const [phase, setPhase] = useState('intro') // intro | answering | analyzing | feedback | finished
  const [answers, setAnswers] = useState([])
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpText, setFollowUpText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const timerRef = useRef(null)
  const [elapsed, setElapsed] = useState(0)
  const answerStartRef = useRef(null)

  // Redirect if no setup
  useEffect(() => {
    if (!setup) navigate('/setup')
  }, [setup])

  // Init questions
  useEffect(() => {
    if (setup) {
      const qs = getQuestions(setup.role, setup.difficulty, setup.questionCount)
      setQuestions(qs)
    }
  }, [setup])

  // Elapsed timer
  useEffect(() => {
    if (phase === 'answering') {
      answerStartRef.current = Date.now()
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - answerStartRef.current) / 1000)), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  const { isRecording, isTranscribing, duration, start, stop, reset } = useRecorder({
    groqKey: state.apiKeys?.groq,
    onTranscript: (text, dur) => {
      setTranscript(text)
      if (text) processAnswer(text, dur)
      else setError('No speech detected. Please try again or switch to text mode.')
    },
    onError: (msg) => setError(msg)
  })

  const currentQuestion = questions[qIndex] || ''
  const progress = questions.length > 0 ? ((qIndex) / questions.length) * 100 : 0

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const processAnswer = useCallback(async (text, dur) => {
    if (!text.trim()) return
    setIsAnalyzing(true)
    setPhase('analyzing')

    // Rule-based analysis
    let analysis = analyzeAnswer(text, currentQuestion, dur || elapsed, setup?.role)

    // Try Claude enhancement (optional)
    if (state.apiKeys?.anthropic) {
      const boost = await analyzeWithClaude(text, currentQuestion, state.apiKeys.anthropic)
      if (boost) {
        analysis.confidence = Math.max(5, Math.min(95, analysis.confidence + (boost.confidence_boost || 0)))
        analysis.communication = Math.max(5, Math.min(95, analysis.communication + (boost.communication_boost || 0)))
        analysis.technical = Math.max(5, Math.min(95, analysis.technical + (boost.technical_boost || 0)))
        if (boost.ai_strengths) analysis.strengths = [...analysis.strengths, ...boost.ai_strengths].slice(0, 4)
        if (boost.ai_suggestions) analysis.suggestions = [...boost.ai_suggestions, ...analysis.suggestions].slice(0, 4)
        if (boost.ai_summary) analysis.aiSummary = boost.ai_summary
        if (boost.ai_tone) analysis.tone = boost.ai_tone
      }
    }

    const newAnswer = {
      question: currentQuestion,
      transcript: text,
      analysis,
      duration: dur || elapsed,
      timestamp: new Date().toISOString()
    }

    setAnswers(prev => [...prev, newAnswer])
    setCurrentAnalysis(analysis)
    setIsAnalyzing(false)

    if (isPractice) {
      setPhase('feedback')
    } else {
      // Simulation: no feedback shown — move directly
      moveToNext([...answers, newAnswer])
    }
  }, [currentQuestion, elapsed, setup, state.apiKeys, answers, isPractice])

  const submitTextAnswer = async () => {
    const text = textAnswer.trim()
    if (!text) { setError('Please write your answer before submitting.'); return }
    setError('')
    await processAnswer(text, elapsed)
    setTextAnswer('')
  }

  const handleRecord = () => {
    setError('')
    setTranscript('')
    if (isRecording) {
      stop()
    } else {
      setPhase('answering')
      start()
    }
  }

  const moveToNext = useCallback((allAnswers) => {
    const nextIndex = qIndex + 1
    if (nextIndex >= questions.length) {
      finishInterview(allAnswers || answers)
    } else {
      setQIndex(nextIndex)
      setPhase('answering')
      setCurrentAnalysis(null)
      setTranscript('')
      setTextAnswer('')
      setShowFollowUp(false)
      setElapsed(0)
    }
  }, [qIndex, questions.length, answers])

  const finishInterview = useCallback((allAnswers) => {
    setPhase('finished')
    const report = generateFinalReport(allAnswers)
    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      setup,
      answers: allAnswers,
      report
    }
    dispatch({ type: 'SAVE_SESSION', payload: session })
    dispatch({ type: 'SET_SESSION', payload: session })
    setTimeout(() => navigate(`/report/${session.id}`), 1200)
  }, [setup, dispatch, navigate])

  const skipQuestion = () => {
    const skippedAnswer = {
      question: currentQuestion,
      transcript: '[Skipped]',
      analysis: analyzeAnswer('', currentQuestion, 0),
      duration: 0,
      timestamp: new Date().toISOString()
    }
    const newAnswers = [...answers, skippedAnswer]
    setAnswers(newAnswers)
    moveToNext(newAnswers)
  }

  const handleNextAfterFeedback = () => {
    moveToNext()
  }

  if (!setup || questions.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size={36} /></div>
  }

  // ---- INTRO ----
  if (phase === 'intro') {
    return (
      <div className="page" style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <Card className="card-sm" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎯</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Ready to begin?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: 14 }}>
            {setup.role} Interview · {setup.difficulty} · {questions.length} questions · {mode} mode
          </p>
          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0, lineHeight: 1.7 }}>
              <strong>Tips:</strong> Speak clearly and at a natural pace. Use the STAR method for behavioral questions.
              Aim for 60–120 second answers. {mode === 'voice' ? 'Click Record when ready, Stop when done.' : 'Type your answer and click Submit.'}
            </p>
          </div>
          <Button variant="primary" className="btn-lg" onClick={() => setPhase('answering')}>
            Begin Interview →
          </Button>
        </Card>
      </div>
    )
  }

  // ---- FINISHED ----
  if (phase === 'finished') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', gap: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: 52 }}>✅</div>
        <h2>Interview Complete!</h2>
        <p style={{ color: 'var(--muted)' }}>Generating your full report...</p>
        <Spinner size={28} />
      </div>
    )
  }

  return (
    <div className="interview-room">
      <div className="ir-main container">

        {/* Header bar */}
        <div className="ir-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="ir-role-badge">{setup.role}</div>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Question {qIndex + 1} of {questions.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {phase === 'answering' && <span className="ir-timer">{formatTime(elapsed)}</span>}
            <Button size="sm" variant="ghost" onClick={() => navigate('/setup')}>Exit</Button>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="ir-progress-track">
            <div className="ir-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {questions.map((_, i) => (
              <div key={i} className={`ir-dot ${i < qIndex ? 'done' : i === qIndex ? 'current' : ''}`} />
            ))}
          </div>
        </div>

        <div className="ir-layout">

          {/* Question + Answer panel */}
          <div className="ir-left">

            {/* Question card */}
            <Card className="card-sm ir-question-card">
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <div className="ir-avatar">AI</div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {showFollowUp ? 'Follow-up' : `Question ${qIndex + 1}`}
                  </div>
                  <p style={{ fontSize: '1rem', color: 'var(--ink)', fontWeight: 500, margin: 0, lineHeight: 1.5 }}>
                    {showFollowUp ? followUpText : currentQuestion}
                  </p>
                </div>
              </div>
            </Card>

            {/* Voice/Text input */}
            {(phase === 'answering' || phase === 'analyzing') && (
              <Card className="card-sm" style={{ padding: '1.25rem' }}>
                {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

                {mode === 'voice' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', padding: '1rem 0' }}>
                    {transcript && (
                      <div style={{ width: '100%', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, minHeight: 60, maxHeight: 120, overflowY: 'auto' }}>
                        {transcript}
                      </div>
                    )}
                    <div className="ir-record-area">
                      {isTranscribing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                          <Spinner size={36} />
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Transcribing your answer...</span>
                        </div>
                      ) : isAnalyzing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                          <Spinner size={36} />
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Analyzing your response...</span>
                        </div>
                      ) : (
                        <>
                          <button
                            className={`ir-mic-btn ${isRecording ? 'recording pulse' : ''}`}
                            onClick={handleRecord}
                            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                          >
                            {isRecording ? '⏹' : '🎤'}
                          </button>
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                            {isRecording ? `Recording... ${formatTime(duration)}` : 'Click to record your answer'}
                          </span>
                          {isRecording && (
                            <div className="waveform-mini">
                              {[...Array(8)].map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.1}s` }} />)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <textarea
                      className="form-textarea"
                      placeholder="Type your answer here..."
                      value={textAnswer}
                      onChange={e => setTextAnswer(e.target.value)}
                      style={{ minHeight: 120, marginBottom: 10 }}
                      disabled={isAnalyzing}
                    />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="ghost" onClick={skipQuestion}>Skip</Button>
                      <Button
                        size="sm" variant="primary"
                        onClick={submitTextAnswer}
                        disabled={isAnalyzing || !textAnswer.trim()}
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Submit Answer →'}
                      </Button>
                    </div>
                  </div>
                )}

                {mode === 'voice' && !isRecording && !isTranscribing && !isAnalyzing && (
                  <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                    <Button size="sm" variant="ghost" onClick={skipQuestion}>Skip Question</Button>
                  </div>
                )}
              </Card>
            )}

            {/* Feedback */}
            {phase === 'feedback' && currentAnalysis && isPractice && (
              <Card className="card-sm" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem' }}>Your Answer</h4>
                  {currentAnalysis.aiSummary && (
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontStyle: 'italic' }}>AI Enhanced</span>
                  )}
                </div>
                {answers[answers.length - 1]?.transcript && answers[answers.length - 1].transcript !== '[Skipped]' && (
                  <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 13, color: 'var(--slate)', lineHeight: 1.6, marginBottom: '1rem', maxHeight: 100, overflowY: 'auto' }}>
                    "{answers[answers.length - 1].transcript}"
                  </div>
                )}
                {currentAnalysis.aiSummary && (
                  <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 13, color: 'var(--accent-dark)', marginBottom: '1rem', fontStyle: 'italic' }}>
                    "{currentAnalysis.aiSummary}"
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <Button size="sm" variant="ghost" onClick={() => {
                    const fu = getFollowUp()
                    setFollowUpText(fu)
                    setShowFollowUp(true)
                    setPhase('answering')
                    setTranscript('')
                    setTextAnswer('')
                    setCurrentAnalysis(null)
                    setElapsed(0)
                  }}>
                    Ask Follow-up
                  </Button>
                  <Button size="sm" variant="primary" onClick={handleNextAfterFeedback}>
                    {qIndex + 1 >= questions.length ? 'Finish Interview →' : 'Next Question →'}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Live feedback panel */}
          <div className="ir-right">
            {phase === 'feedback' && currentAnalysis && isPractice ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <Card className="card-sm" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem' }}>Live Feedback</h4>
                    <QualityBadge quality={currentAnalysis.quality} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
                    {[
                      { label: 'Confidence', val: currentAnalysis.confidence, icon: '💪' },
                      { label: 'Communication', val: currentAnalysis.communication, icon: '🗣' },
                      { label: 'Technical', val: currentAnalysis.technical, icon: '🧠' },
                      { label: 'Word count', val: null, text: currentAnalysis.wordCount + 'w', icon: '📝' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{m.icon} {m.label}</div>
                        {m.val !== null ? (
                          <ProgressBar value={m.val} size="sm" showValue={true} />
                        ) : (
                          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{m.text}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tone */}
                  <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: '1rem' }}>
                    Tone detected: <strong style={{ color: 'var(--ink)', textTransform: 'capitalize' }}>{currentAnalysis.tone}</strong>
                  </div>

                  {/* Filler words */}
                  {currentAnalysis.fillerWords?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Filler words</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {currentAnalysis.fillerWords.map(f => (
                          <span key={f.word} style={{ background: 'var(--amber-light)', color: 'var(--amber)', fontSize: 12, padding: '2px 8px', borderRadius: 12 }}>
                            "{f.word}" ×{f.count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Strengths */}
                {currentAnalysis.strengths?.length > 0 && (
                  <Card className="card-sm" style={{ padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--green)' }}>✓ Strengths</h4>
                    <ul className="strength-list">
                      {currentAnalysis.strengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </Card>
                )}

                {/* Suggestions */}
                {currentAnalysis.suggestions?.length > 0 && (
                  <Card className="card-sm" style={{ padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>💡 Suggestions</h4>
                    <ul className="suggestion-list">
                      {currentAnalysis.suggestions.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="card-sm" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Session Progress</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {questions.map((q, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600,
                        background: i < qIndex ? 'var(--green-light)' : i === qIndex ? 'var(--accent-light)' : 'var(--surface-2)',
                        color: i < qIndex ? 'var(--green)' : i === qIndex ? 'var(--accent)' : 'var(--muted)',
                      }}>
                        {i < qIndex ? '✓' : i + 1}
                      </div>
                      <div style={{ fontSize: 12, color: i < qIndex ? 'var(--muted)' : i === qIndex ? 'var(--ink)' : 'var(--muted)', flex: 1, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {q}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .interview-room { padding: 1.5rem 0; }
        .ir-main { max-width: 1000px; }
        .ir-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 8px; }
        .ir-role-badge { background: var(--accent-light); color: var(--accent); font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
        .ir-timer { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 600; color: var(--ink); background: var(--surface-2); padding: 4px 12px; border-radius: var(--radius-sm); }
        .ir-progress-track { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin-bottom: 8px; }
        .ir-progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.4s ease; }
        .ir-dot { flex: 1; height: 6px; border-radius: 3px; background: var(--border); transition: background 0.3s; margin: 0 1px; }
        .ir-dot.done { background: var(--green); }
        .ir-dot.current { background: var(--accent); }
        .ir-layout { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; }
        .ir-left { display: flex; flex-direction: column; gap: 1rem; }
        .ir-right { display: flex; flex-direction: column; gap: 0; }
        .ir-question-card { padding: 1.25rem; }
        .ir-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--ink); color: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .ir-record-area { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .ir-mic-btn { width: 72px; height: 72px; border-radius: 50%; border: none; background: var(--accent); color: white; font-size: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 16px rgba(59,91,219,0.3); }
        .ir-mic-btn:hover { transform: scale(1.05); }
        .ir-mic-btn.recording { background: var(--red); box-shadow: 0 4px 16px rgba(201,42,42,0.4); }
        .waveform-mini { display: flex; gap: 3px; align-items: center; height: 24px; }
        .waveform-mini span { display: block; width: 4px; background: var(--red); border-radius: 2px; height: 8px; animation: wv 0.8s ease-in-out infinite alternate; }
        @keyframes wv { 0%{height:4px} 100%{height:20px} }
        @media (max-width: 768px) { .ir-layout { grid-template-columns: 1fr; } .ir-right { order: -1; } }
      `}</style>
    </div>
  )
}
