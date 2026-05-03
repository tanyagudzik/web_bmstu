import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppNavbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ServicePage from './pages/ServicePage'
import RequestPage from './pages/RequestPage'

function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/support_services" element={<ServicesPage />} />
        <Route path="/support_service/:id" element={<ServicePage />} />
        <Route path="/support_request" element={<RequestPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App