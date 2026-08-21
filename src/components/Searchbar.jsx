import { Search, Loader2 } from 'lucide-react'
import { useState } from 'react'
export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  async function submit(event) { event.preventDefault(); if (!query.trim()) return; setLoading(true); setError(''); try { await onSearch(query.trim()) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  return <form onSubmit={submit} className="search-shell"><Search size={18} className="text-slate" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a place in Nepal..." aria-label="Search a place in Nepal" />{loading ? <Loader2 size={18} className="animate-spin text-ocean" /> : <button type="submit" className="search-button">Search</button>}{error && <p className="search-error">{error}</p>}</form>
}
