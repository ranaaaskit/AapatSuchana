import { HeartPulse, LogOut, Radio, Shield } from 'lucide-react'
import SearchBar from './SearchBar'
import '../navbar.css'
export default function Navbar({ onSearch, onSignOut }) { return <header className="topbar"><div className="brand"><span className="brand-mark"><HeartPulse size={21} /></span><div><strong>AapatSuchana</strong><span>DISASTER & HAZARD MAP</span></div></div><SearchBar onSearch={onSearch} /><div className="nav-status"><span className="live-dot" /> Live monitoring <i /> <Shield size={15} /> Open data <i /> <Radio size={15} /> Free to use <button className="signout-button" onClick={onSignOut} aria-label="Sign out"><LogOut size={15} /> Sign out</button></div></header> }
