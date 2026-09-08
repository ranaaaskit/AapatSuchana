import { useState } from 'react'
import { ArrowRight, Languages, Loader2, Moon, ShieldCheck, Sun } from 'lucide-react'
import { signIn, signUp } from '../services/apiClient'
import logo from '../assets/aapatsuchana-logo.svg'
import '../auth.css'

export default function AuthPage({ theme, language = 'en', onToggleLanguage, onToggleTheme, onEmployeeLogin, onAuthenticated }) {
  const nepali = language === 'ne'
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
        <div className="auth-brand"><span className="logo-box"><img className="auth-logo" src={logo} alt="AapatSuchana" /></span><div className="auth-top-actions"><button className="auth-employee-top" onClick={onEmployeeLogin}>{nepali ? 'कर्मचारी?' : 'Employee?'}</button><button className="language-toggle" onClick={onToggleLanguage} aria-label={nepali ? 'Switch to English' : 'नेपालीमा बदल्नुहोस्'}><Languages size={15} /> {nepali ? 'English' : 'नेपाली'}</button><button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button></div></div>
        <div className="auth-copy"><span className="auth-kicker"><ShieldCheck size={15} /> {nepali ? 'विश्वसनीय समुदाय रिपोर्ट' : 'Trusted community reports'}</span><h1>{mode === 'login' ? (nepali ? 'फेरि स्वागत छ।' : 'Welcome back.') : (nepali ? 'सुरक्षा सञ्जालमा जोडिनुहोस्।' : 'Join the safety network.')}</h1><p>{mode === 'login' ? (nepali ? 'जोखिम पछ्याउन र प्रमाणित स्थानीय जानकारी प्रकाशित गर्न साइन इन गर्नुहोस्।' : 'Sign in to follow hazards and publish verified local updates.') : (nepali ? 'समुदायलाई जोखिम समयमै देखाउन खाता बनाउनुहोस्।' : 'Create an account to help your community see hazards as they happen.')}</p></div>
        <form className="auth-form" onSubmit={submit}>
          <label>{nepali ? 'इमेल ठेगाना' : 'Email address'}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
          <label>{nepali ? 'पासवर्ड' : 'Password'}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={nepali ? 'कम्तीमा ६ अक्षर' : 'At least 6 characters'} minLength="6" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="auth-submit" disabled={loading}>{loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}{mode === 'login' ? (nepali ? 'साइन इन' : 'Sign in') : (nepali ? 'खाता बनाउनुहोस्' : 'Create account')}</button>
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}>
          {mode === 'login' ? (nepali ? 'खाता छैन? साइन अप गर्नुहोस्' : 'Need an account? Sign up') : (nepali ? 'पहिले नै खाता छ? साइन इन गर्नुहोस्' : 'Already have an account? Sign in')}
        </button>
      </section>
      <aside className="auth-aside"><div className="auth-aside-grid" /><span>{nepali ? 'प्रत्यक्ष / नेपाल' : 'LIVE / NEPAL'}</span><h2>{nepali ? <>समयमै जान्नुहोस्।<br />सुरक्षित अघि बढ्नुहोस्।</> : <>Know sooner.<br />Move safer.</>}</h2><p>{nepali ? 'बाढी, पहिरो, सडक अवरोध र तिनबाट प्रभावित मानिसहरूको साझा दृश्य।' : 'One shared view for floods, landslides, roadblocks, and the people navigating them.'}</p></aside>
    </main>
  )
}
