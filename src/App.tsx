// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import ReadMd from './pages/readmd' // Your markdown reading component

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main page showing log list and 3D background */}
        <Route path="/" element={<Home />} />
        
        {/* Log reader route */}
        <Route path="/log/:slug" element={<ReadMd />} />
      </Routes>
    </BrowserRouter>
  )
}