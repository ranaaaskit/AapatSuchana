import { Search, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { searchNepalLocations } from '../services/geocodingService'
export default function SearchBar({ onSearch, language = 'en' }) {
  const nepali = language === 'ne'
  const [query, setQuery] = useState(''); const [suggestions, setSuggestions] = useState([]); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const requestRef = useRef(null)
  useEffect(() => {
    const trimmedQuery = query.trim()
    if (trimmedQuery.length < 2) { setSuggestions([]); return undefined }
    const controller = new AbortController()
    requestRef.current = window.setTimeout(async () => {
      setLoading(true); setError('')
      try { setSuggestions(await searchNepalLocations(trimmedQuery, controller.signal)) } catch (err) { if (err.name !== 'AbortError') setError(err.message) } finally { if (!controller.signal.aborted) setLoading(false) }
    }, 350)
    return () => { controller.abort(); window.clearTimeout(requestRef.current) }
  }, [query])
  async function selectSuggestion(suggestion) { setQuery(suggestion.label.split(',')[0]); setSuggestions([]); setError(''); await onSearch(suggestion.label) }
  async function submit(event) { event.preventDefault(); if (!query.trim()) return; setLoading(true); setError(''); try { await onSearch(query.trim()); setSuggestions([]) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  function clearSearch() { setQuery(''); setSuggestions([]); setError('') }
  return <form onSubmit={submit} className="search-shell"><Search size={18} className="text-slate" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={nepali ? 'नेपालमा स्थान खोज्नुहोस्...' : 'Search a place in Nepal...'} aria-label={nepali ? 'नेपालमा स्थान खोज्नुहोस्' : 'Search a place in Nepal'} aria-autocomplete="list" />{query && <button type="button" className="search-clear" onClick={clearSearch} aria-label={nepali ? 'खोजी खाली गर्नुहोस्' : 'Clear search'} title={nepali ? 'खोजी खाली गर्नुहोस्' : 'Clear search'}><X size={15} /></button>}{loading ? <Loader2 size={18} className="animate-spin text-ocean" /> : <button type="submit" className="search-button">{nepali ? 'खोज्नुहोस्' : 'Search'}</button>}{suggestions.length > 0 && <div className="search-suggestions" role="listbox">{suggestions.map((suggestion) => <button type="button" key={`${suggestion.lat}-${suggestion.lng}`} onClick={() => void selectSuggestion(suggestion)} role="option"><strong>{suggestion.label.split(',')[0]}</strong><span>{suggestion.label}</span></button>)}</div>}{error && <p className="search-error">{error}</p>}</form>
}
