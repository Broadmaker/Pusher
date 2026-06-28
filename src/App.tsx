import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ApiProvider } from './data/api-context'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ui'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AppSettings from './pages/AppSettings'
import Devices from './pages/Devices'
import SendNotification from './pages/SendNotification'
import NotificationHistory from './pages/NotificationHistory'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <ApiProvider>
        <ToastProvider>
        <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="apps/create" element={<Navigate to="/dashboard" replace />} />
            <Route path="apps/:id" element={<AppSettings />} />
            <Route path="apps/:id/devices" element={<Devices />} />
            <Route path="apps/:id/notify" element={<SendNotification />} />
            <Route path="apps/:id/history" element={<NotificationHistory />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </ErrorBoundary>
        </ToastProvider>
      </ApiProvider>
    </BrowserRouter>
  )
}

export default App
