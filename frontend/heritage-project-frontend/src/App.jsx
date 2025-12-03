import { useEffect, useState } from 'react'
import './App.css'
import Layout from './layout'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import AuthLogin from './pages/auth'
import Home from './pages/home'
import CourseView from './pages/course_view'
import RoomEditor from './pages/room_editor'
import RoomViewer from './pages/room_viewer'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorPopup from './components/ErrorPopup'
import ProfilePage from './pages/profile.jsx'
import CourseDashboard from './pages/CourseDashboard'
import CourseSettings from './pages/CourseSettings'
import CreationDashboard from './pages/CourseEditor'

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
                <Route path='/u/:username' element={<ProfilePage />}></Route>
                <Route path='/c/:courseId' element={<CourseDashboard />}></Route>
                <Route path='/r/:course_id/:section_id/:room_id' element={<RoomViewer />}></Route>
                <Route path='/re/:course_id/:section_id/:room_id' element={<RoomEditor />}></Route>
                <Route path ='/s/:courseId' element={<CourseSettings/>}></Route>
                <Route path ='/ce/:courseId' element={<CreationDashboard/>}></Route>
        </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
      <ErrorPopup />
    </div>
  );
}

export default App
