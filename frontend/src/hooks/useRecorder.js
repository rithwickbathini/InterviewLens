import { useState, useRef, useCallback } from 'react'
import { transcribeWithGroq } from '../utils/analysis'

export default function useRecorder({ groqKey, onTranscript, onError }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  const getSupportedMime = () => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
    return types.find(t => MediaRecorder.isTypeSupported(t)) || ''
  }

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mimeType = getSupportedMime()
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = mr

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        clearInterval(timerRef.current)
        const dur = Date.now() - startTimeRef.current

        if (chunksRef.current.length === 0) {
          onError?.('No audio recorded.')
          return
        }

        const mT = chunksRef.current[0].type || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mT })

        if (groqKey) {
          setIsTranscribing(true)
          try {
            const text = await transcribeWithGroq(blob, groqKey)
            onTranscript?.(text, Math.round(dur / 1000), blob)
          } catch (err) {
            onError?.(err.message)
          } finally {
            setIsTranscribing(false)
          }
        } else {
          // Fallback: return empty — user should use text mode
          onError?.('Groq API key not set. Use text mode or add your Groq key in Settings.')
        }
      }

      mr.start(1000)
      startTimeRef.current = Date.now()
      setIsRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        onError?.('Microphone permission denied. Allow microphone in browser settings.')
      } else {
        onError?.('Microphone error: ' + err.message)
      }
    }
  }, [groqKey, onTranscript, onError])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setDuration(0)
    setIsTranscribing(false)
    chunksRef.current = []
  }, [stop])

  return { isRecording, isTranscribing, duration, start, stop, reset }
}
