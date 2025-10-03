import { useEffect, useState } from 'react'
import './App.css'
import Layout from './layout'

import {BrowserRouter, Routes, Route} from "react-router-dom"
import AuthLogin from './pages/auth'
import CourseView from './pages/course_view'
import RoomEditor from './pages/room_editor'
import TaskEditor from './components/task_editor'
function App() {
 return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AuthLogin />} />
        <Route path='/course_view' element={<CourseView />} />
        <Route path='/room_editor' element={<RoomEditor />} />
        <Route path='/task_editor' element={<TaskEditor/>} />
      </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
