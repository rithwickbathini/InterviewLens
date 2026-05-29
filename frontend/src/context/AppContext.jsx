import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const initialState = {
  user: JSON.parse(localStorage.getItem('il_user') || 'null') || { name: 'Guest', isGuest: true },
  theme: localStorage.getItem('theme') || 'light',
  sessions: JSON.parse(localStorage.getItem('il_sessions') || '[]'),
  currentSetup: null,
  currentSession: null,
  apiKeys: {
    anthropic: localStorage.getItem('anthropic_api_key') || '',
    groq: localStorage.getItem('groq_api_key') || ''
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      localStorage.setItem('il_user', JSON.stringify(action.payload))
      return { ...state, user: action.payload }
    case 'TOGGLE_THEME': {
      const theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
      return { ...state, theme }
    }
    case 'SET_SETUP':
      return { ...state, currentSetup: action.payload }
    case 'SET_SESSION':
      return { ...state, currentSession: action.payload }
    case 'SAVE_SESSION': {
      const sessions = [action.payload, ...state.sessions.slice(0, 19)]
      localStorage.setItem('il_sessions', JSON.stringify(sessions))
      return { ...state, sessions }
    }
    case 'SET_API_KEYS': {
      if (action.payload.anthropic) localStorage.setItem('anthropic_api_key', action.payload.anthropic)
      if (action.payload.groq) localStorage.setItem('groq_api_key', action.payload.groq)
      return { ...state, apiKeys: { ...state.apiKeys, ...action.payload } }
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
