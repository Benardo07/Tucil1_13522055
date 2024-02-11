import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Firstpage from './components/firstpage'
import Manual from './components/manual'
import File from './components/file'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Firstpage />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/file-upload" element={<File />} />
      </Routes>
    </Router>
  )
}

export default App
