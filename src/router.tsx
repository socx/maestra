import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import { ExercisePage } from './pages/ExercisePage'
import { HelpPage } from './pages/HelpPage'
import { HomePage } from './pages/HomePage'
import { PracticePage } from './pages/PracticePage'
import { WordListPage } from './pages/WordListPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/word-list" element={<WordListPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}
