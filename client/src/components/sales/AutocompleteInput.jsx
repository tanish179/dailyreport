import { useState, useEffect, useRef } from 'react';

export default function AutocompleteInput({
  value,
  onChange,
  suggestions = [],
  placeholder = '',
  style = {},
  error = false,
  onEnterKeyPress = null
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    // Filter suggestions based on value
    if (value.trim() === '') {
      // If empty, show first 5 suggestions as defaults
      setFiltered(suggestions.slice(0, 5));
    } else {
      const filteredList = suggestions.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFiltered(filteredList.slice(0, 5)); // show top 5 matches
    }
    setActiveIdx(-1);
  }, [value, suggestions]);

  useEffect(() => {
    // Close suggestions when clicking outside
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showSuggestions) {
      if (e.key === 'Enter' && onEnterKeyPress) {
        // Let form handle normal Enter key navigation
        onEnterKeyPress(e);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && activeIdx < filtered.length) {
        e.preventDefault();
        e.stopPropagation();
        onChange(filtered[activeIdx]);
        setShowSuggestions(false);
      } else {
        // Let form handle Enter
        if (onEnterKeyPress) {
          onEnterKeyPress(e);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
    }
  };

  const handleSelect = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        className="form-input"
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          ...style,
          borderColor: error ? 'var(--accent-rose)' : undefined
        }}
      />
      
      {showSuggestions && filtered.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius)',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 1000,
            listStyle: 'none',
            padding: '4px 0',
            margin: 0,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {filtered.map((suggestion, idx) => {
            const isActive = idx === activeIdx;
            return (
              <li
                key={suggestion}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setActiveIdx(idx)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-primary)',
                  background: isActive ? 'var(--accent-blue-glow)' : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                  textAlign: 'left'
                }}
              >
                {suggestion}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
