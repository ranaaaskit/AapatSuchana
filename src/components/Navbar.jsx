import { HeartPulse, Radio, Shield } from 'lucide-react'
import SearchBar from './SearchBar'
export default function Navbar({ onSearch }) { return <header className="topbar"><div className="brand"><span className="brand-mark"><HeartPulse size={21} /></span><div><strong>AapatSuchana</strong><span>DISASTER & HAZARD MAP</span></div></div><SearchBar onSearch={onSearch} /><div className="nav-status"><span className="live-dot" /> Live monitoring <i /> <Shield size={15} /> Open data <i /> <Radio size={15} /> Free to use</div></header> }
