import { useEffect, useState } from 'react'
import './App.css'
import AuthLogin from './components/auth'
import CourseView from './components/course_view'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <AuthLogin/>
        <CourseView />
      </div>
    </>
  )
}

export default App
