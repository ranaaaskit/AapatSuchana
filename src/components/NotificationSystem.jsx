import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

function playAlertBeep() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return

  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(880, context.currentTime)
  gain.gain.setValueAtTime(0.001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.35)
  oscillator.addEventListener('ended', () => { void context.close() }, { once: true })
}

export default function NotificationSystem({ alertLevel, message = 'Critical hazard detected. Review the affected area immediately.', onDismiss }) {
  const [visible, setVisible] = useState(alertLevel === 'Critical')
  const previousLevel = useRef(alertLevel)

  useEffect(() => {
    const enteringCritical = alertLevel === 'Critical' && previousLevel.current !== 'Critical'
    if (alertLevel === 'Critical') {
      setVisible(true)
      if (enteringCritical) {
        try { playAlertBeep() } catch (audioError) { void audioError }
      }
    } else {
      setVisible(false)
    }
    previousLevel.current = alertLevel
  }, [alertLevel])

  if (!visible || alertLevel !== 'Critical') return null

  function dismiss() {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <div className="notification-system" role="alert" aria-live="assertive">
      <div className="notification-copy">
        <AlertTriangle size={20} aria-hidden="true" />
        <div>
          <strong>Critical warning</strong>
          <span>{message}</span>
        </div>
      </div>
      <button type="button" onClick={dismiss} aria-label="Dismiss critical warning" title="Dismiss warning">
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
