import React, { useEffect, useState } from 'react'
import Firstpage from './components/firstpage'
import Manual from './components/manual'
import File from './components/file'
function App() {

  const [backendData, setBackendData] = useState([{}])


  return (
    <div>
      <File/>
    </div>
  )
}

export default App
