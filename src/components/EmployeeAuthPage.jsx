import { useState } from 'react'
import { ArrowRight, BriefcaseBusiness, Loader2, Moon, ShieldCheck, Sun } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import logo from '../assets/aapatsuchana-logo.svg'
import '../auth.css'

export default function EmployeeAuthPage({ theme, onToggleTheme, onAuthorized, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }
    const { data: employee, error: employeeError } = await supabase.from('employee_accounts').select('display_name').eq('email', email.trim().toLowerCase()).eq('active', true).maybeSingle()
    if (employeeError || !employee) {
      await supabase.auth.signOut()
      setError(employeeError ? 'Employee access is not configured yet. Ask an administrator to add your account.' : 'This account is not approved for employee access.')
      setLoading(false)
      return
    }
    onAuthorized(data.session, employee.display_name)
    setLoading(false)
  }

  return (
    <main className="auth-page employee-auth-page">
      <section className="auth-panel">
        <div className="auth-brand"><span className="logo-box"><img className="auth-logo" src={logo} alt="AapatSuchana" /></span><span className="employee-brand-label"><BriefcaseBusiness size={16} /> Employee access</span><button className="theme-toggle auth-theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button></div>
        <div className="auth-copy"><span className="auth-kicker"><ShieldCheck size={15} /> Restricted workspace</span><h1>Operations, in focus.</h1><p>Sign in with your approved employee account to review, verify, and resolve community reports.</p></div>
        <form className="auth-form" onSubmit={submit}><label>Employee email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="employee@your-org.com" autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your secure password" autoComplete="current-password" required /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" disabled={loading}>{loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}Enter employee dashboard</button></form>
        <button className="auth-switch" onClick={onBack}>Back to public sign in</button>
      </section>
      <aside className="auth-aside"><div className="auth-aside-grid" /><span>STAFF / NEPAL</span><h2>Respond<br />with clarity.</h2><p>A focused workspace for teams coordinating safer responses across Nepal.</p></aside>
    </main>
  )
}
