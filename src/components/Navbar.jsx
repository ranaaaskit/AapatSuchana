import { LogOut, Moon, Radio, Sun } from 'lucide-react'
import SearchBar from './SearchBar'
import logo from '../assets/aapatsuchana-logo.svg'
import '../navbar.css'
export default function Navbar({ onSearch, onSignOut, theme, onToggleTheme }) { return <header className="topbar"><div className="brand"><span className="brand-mark"><img className="dashboard-logo" src={logo} alt="" /></span><div><strong>AapatSuchana</strong><span>DISASTER & HAZARD MAP</span></div></div><SearchBar onSearch={onSearch} /><div className="nav-status"><span className="live-dot" /> Live monitoring <i /> <Radio size={15} /> Free to use <button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}</button><button className="signout-button" onClick={onSignOut} aria-label="Sign out"><LogOut size={15} /> Sign out</button></div></header> }
