import { useState } from 'react'
import './App.css'
import AuthLogin from './components/auth'
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
