import { BrowserRouter, Route, Routes } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import { ExercisePage } from './pages/ExercisePage'
import { HelpPage } from './pages/HelpPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PracticePage } from './pages/PracticePage'
import { WordListPage } from './pages/WordListPage'

export function AppRouter() {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

  return (
    <BrowserRouter basename={base}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/word-list" element={<WordListPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
