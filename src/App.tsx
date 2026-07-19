import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './AppContext'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import QuickActions from './components/QuickActions'
import Dashboard from './pages/Dashboard'
import AICoach from './pages/AICoach'
import ProblemCheck from './pages/ProblemCheck'
import JudgeSimulator from './pages/JudgeSimulator'
import ScopeGuard from './pages/ScopeGuard'
import DecisionJournal from './pages/DecisionJournal'
import PhaseRoadmap from './pages/PhaseRoadmap'
import TeamHub from './pages/TeamHub'
import './App.css'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="glow-bg" style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          <Sidebar open={sidebarOpen} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            <TopBar onMenuClick={() => setSidebarOpen(o => !o)} />
            <main style={{
              flex: 1,
              overflowY: 'auto',
              padding: '28px 32px',
              background: 'var(--bg-base)',
            }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/coach" element={<AICoach />} />
                <Route path="/problem" element={<ProblemCheck />} />
                <Route path="/judge" element={<JudgeSimulator />} />
                <Route path="/scope" element={<ScopeGuard />} />
                <Route path="/team" element={<TeamHub />} />
                <Route path="/journal" element={<DecisionJournal />} />
                <Route path="/roadmap" element={<PhaseRoadmap />} />
              </Routes>
            </main>
            <QuickActions />
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
