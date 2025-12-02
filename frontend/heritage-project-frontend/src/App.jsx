import { useEffect, useState } from 'react'
import './App.css'
import Layout from './layout'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import AuthLogin from './pages/auth'
import Home from './pages/home'
import CourseView from './pages/course_view'
import RoomEditor from './pages/room_editor'
import RoomViewer from './pages/room_viewer'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorPopup from './components/ErrorPopup'
import ProfilePage from './pages/profile.jsx'
import CourseDashboard from './pages/CourseDashboard'

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
          <Route path='/home/:username' element={<Home />} />
          <Route path='/courses' element={<CourseView />} />
          <Route path='/courses/:course_id/sections/:section_id/rooms/:room_id/edit' element={<RoomEditor />} />
          <Route path='/courses/:course_id/sections/:section_id/rooms/:room_id/view' element={<RoomViewer />} />
          <Route path='/u/:username' element={<ProfilePage/>}></Route>
          <Route path ='/c/:courseId' element={<CourseDashboard/>}></Route>
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
