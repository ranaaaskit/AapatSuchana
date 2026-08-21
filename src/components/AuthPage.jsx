import { useState } from 'react'
import { ArrowRight, HeartPulse, Loader2, ShieldCheck } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import '../auth.css'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })

    if (result.error) {
      setError(result.error.message)
    } else if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Check your email to confirm your account.')
    }
    setLoading(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand"><span className="brand-mark"><HeartPulse size={21} /></span><div><strong>AapatSuchana</strong><span>COMMUNITY SAFETY MAP</span></div></div>
        <div className="auth-copy"><span className="auth-kicker"><ShieldCheck size={15} /> Trusted community reports</span><h1>{mode === 'login' ? 'Welcome back.' : 'Join the safety network.'}</h1><p>{mode === 'login' ? 'Sign in to follow hazards and publish verified local updates.' : 'Create an account to help your community see hazards as they happen.'}</p></div>
        <form className="auth-form" onSubmit={submit}>
          <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength="6" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="auth-submit" disabled={loading}>{loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </section>
      <aside className="auth-aside"><div className="auth-aside-grid" /><span>LIVE / NEPAL</span><h2>Know sooner.<br />Move safer.</h2><p>One shared view for floods, landslides, roadblocks, and the people navigating them.</p></aside>
    </main>
  )
}
