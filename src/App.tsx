// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import ReadMd from './pages/readmd' // Your markdown reading component
import Navbar from './navbar'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar/>
      <div className="pt-20">
      <Routes>
        {/* Main page showing log list and 3D background */}
        <Route path="/" element={<Home />} />
        <Route path="/log/:slug" element={<ReadMd />} />
      </Routes>
      </div>
    </BrowserRouter>
  )
}