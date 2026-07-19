import React, { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'

type AppContextType = {
  hackathonName: string
  setHackathonName: (v: string) => void
  teamName: string
  setTeamName: (v: string) => void
  currentPhase: number
  setCurrentPhase: (v: number) => void
  totalPhases: number
  overallProgress: number
  setOverallProgress: (v: number) => void
  problemCheckDone: boolean
  setProblemCheckDone: (v: boolean) => void
  problemAnswers: string[]
  setProblemAnswers: (v: string[]) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [hackathonName, setHackathonName] = useLocalStorage('sp_hackathonName', 'Global AI Hackathon')
  const [teamName, setTeamName] = useLocalStorage('sp_teamName', 'Sprint Builders')
  const [currentPhase, setCurrentPhase] = useLocalStorage('sp_currentPhase', 5)
  const [overallProgress, setOverallProgress] = useLocalStorage('sp_overallProgress', 47)
  const [problemCheckDone, setProblemCheckDone] = useLocalStorage('sp_problemCheckDone', false)
  const [problemAnswers, setProblemAnswers] = useLocalStorage<string[]>('sp_problemAnswers', Array(5).fill(''))

  const totalPhases = 14

  return (
    <AppContext.Provider value={{
      hackathonName, setHackathonName,
      teamName, setTeamName,
      currentPhase, setCurrentPhase,
      totalPhases,
      overallProgress, setOverallProgress,
      problemCheckDone, setProblemCheckDone,
      problemAnswers, setProblemAnswers,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
