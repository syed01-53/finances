import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Dashboard from '../pages/Dashboard'
import ClientPage from '../pages/Client'
import ReportPage from '../pages/Report'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clients">
          <Route index element={<ClientPage />} />
          <Route path=":id" element={<ClientPage />} />
        </Route>
        <Route path="reports">
          <Route index element={<ReportPage />} />
          <Route path=":id" element={<ReportPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
