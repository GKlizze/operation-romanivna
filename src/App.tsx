import { Navigate, Route, Routes } from 'react-router-dom'
import { GameProvider } from './game/GameContext'
import { Game } from './screens/Game'
import { Admin } from './admin/Admin'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <GameProvider>
            <Game />
          </GameProvider>
        }
      />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
