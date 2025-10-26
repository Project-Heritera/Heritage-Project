import { useEffect, useState } from 'react'
import './App.css'
import Layout from './layout'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import AuthLogin from './pages/auth'
import Home from './pages/home'
import CourseView from './pages/course_view'
import RoomEditor from './pages/room_editor'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorPopup from './components/ErrorPopup'

function App() {
 return (
  <div>
    <div>
      
    <BrowserRouter>
      <Routes>
        {/*Public Routes*/}
        <Route path="/" element={<Layout />}>
          <Route index element={<AuthLogin />} />
        <Route path='/login' element={<AuthLogin />} />
        {/*Protected Routes*/}
        <Route element={<ProtectedRoute />}>
          <Route path='/course_view' element={<CourseView />} />
          <Route path='/room_editor' element={<RoomEditor />} />
        </Route>
      </Route>
      </Routes>
    </BrowserRouter>
    </div>
    <ErrorPopup/>
  </div>
  );
}

export default App
