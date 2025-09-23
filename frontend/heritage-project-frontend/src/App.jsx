import { useEffect, useState } from 'react'
import './App.css'
import AuthLogin from './components/auth'
import axios from "axios"
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <AuthLogin/>
      </div>
    </>
  )
}

export default App
