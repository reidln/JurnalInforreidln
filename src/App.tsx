// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Profile from './pages/profile'
import ReadMd from './pages/readmd' 
import Navbar from './navbar'

export default function App() {
  // Use your production domain URL when you deploy, or localhost for testing
  
  return (
    <>
    <BrowserRouter>
      <Navbar/>
      
      {/* 
        1. Fixed styling: Added a concrete width (w-80 or w-96) 
        2. Shadow and rounded corners make it look like a floating widget
      */}
      

      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/log/:slug" element={<ReadMd />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
    
    </>
  )
}
