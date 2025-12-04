// This page is the render for the home page at the root

import CourseCard from "../components/CourseViewer/CourseCard";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";

// Helper for random progress
const rand = () => Math.random().toFixed(2);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [username, setUsername] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    setLoading(true);
    console.log("Retrieving coruses");
    const getCourses = async () => {
      try {
        const response = await api.get(`/website/courses_progressed/`);
        const courseList = response.data;

        const userResponse = await api.get(`/accounts/user_info/`)
        const userData = userResponse.data
        setUser(userData)
        setUsername(userData.username)

        console.log("Success loading user:", username)
        console.log("Users data is:", userData)
        console.log("Loaded course list is:", courseList);
        setCourses(courseList || []);
      } catch (error) {
        console.error("Error retrieving courses:", error);
      } finally {
        setLoading(false);
      }
    };

    getCourses();
  }, []);

  return (
    <div className="flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between m-4">
        <h1 className="scroll-m-20 text-center text-3xl font-bold tracking-tight text-balance">
          Welcome back, {username}
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4 m-4">
        <div className="col-span-3">

          {/* 2-column course grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Example courses — same ones from your CourseView */}
            {!loading &&
              courses.map((course) => (
                <CourseCard
                  key={course.title}
                  link=""
                  title={course.title}
                  description={course.description}
                  imageLink={`${import.meta.env.VITE_API_URL_FOR_TEST}${course.image
                    }`}
                  courseId={course.course_id}
                  progress={course.progress_percent}
                />
              ))}
          </div>
        </div>

        <div className="col-span-1 space-y-4">
          {/* Title */}
          {/* Daily Quests */}
          <Card className="p-4">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Daily Quest{" "}
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">📘 Complete 1 Lesson</p>
                <p className="text-sm text-muted-foreground">+20 XP</p>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">⏱ Study 15 Minutes</p>
                <p className="text-sm text-muted-foreground">+15 XP</p>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">🔁 Review a Previous Lesson</p>
                <p className="text-sm text-muted-foreground">+10 XP</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Achievements{" "}
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">🏅 3-Day Study Streak</p>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">🎉 First Course Started</p>
              </div>

              <div className="p-3 rounded-lg bg-muted opacity-60">
                <p className="font-medium">🔒 Complete 5 Courses</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
