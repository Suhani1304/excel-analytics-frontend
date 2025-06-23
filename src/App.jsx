import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import AdminRegisterPage from "./pages/AdminRegisterPage"
import Dashboard from "./pages/Dashboard"
import UploadPage from "./pages/UploadPage"
import ChartPage from "./pages/ChartPage"
import AnalyticsPage from "./pages/AnalyticsPage"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin-register" element={<AdminRegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/chart" element={<ChartPage />} />
            <Route path="/analytics/:fileId" element={<AnalyticsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
