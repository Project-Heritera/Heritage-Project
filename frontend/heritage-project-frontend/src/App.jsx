import { useEffect, useState } from 'react'
import './App.css'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import AuthLogin from './pages/auth'
import CourseView from './pages/course_view'
function App() {
 return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<AuthLogin />} />
        <Route path='/course_view' element={<CourseView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
