import { useState } from 'react'
import { ArrowRight, Loader2, Moon, ShieldCheck, Sun } from 'lucide-react'
import { signIn, signUp } from '../services/apiClient'
import logo from '../assets/aapatsuchana-logo.svg'
import '../auth.css'

export default function AuthPage({ theme, onToggleTheme, onEmployeeLogin, onAuthenticated }) {
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

    try {
      const session = mode === 'login' ? await signIn(email, password) : await signUp(email, password)
      onAuthenticated(session)
    } catch (requestError) {
      setError(requestError.message)
    }
    setLoading(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand"><span className="logo-box"><img className="auth-logo" src={logo} alt="AapatSuchana" /></span><div className="auth-top-actions"><button className="auth-employee-top" onClick={onEmployeeLogin}>Employee?</button><button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button></div></div>
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
