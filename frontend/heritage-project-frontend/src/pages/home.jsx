import CourseCard from "../components/CourseViewer/CourseCard";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
// 1. ADD: Import Button and useNavigate
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Link } from "react-router-dom";

// Helper for random progress
const rand = () => Math.random().toFixed(2);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [username, setUsername] = useState(null);
  const [user, setUser] = useState(null);

  // 2. ADD: Initialize the navigate hook
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    console.log("Retrieving coruses");
    const getCourses = async () => {
      try {
        const response = await api.get(`/website/courses_progressed/`);
        const courseList = response.data;

        const userResponse = await api.get(`/accounts/user_info/`);
        const userData = userResponse.data;
        setUser(userData);
        setUsername(userData.username);

        // Safety check to ensure courseList is an array
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
      <div className="flex items-center justify-between m-4 " style={{ fontFamily: "'Zalando Sans Expanded', sans-serif" }}>
        <h1 className="scroll-m-20 text-center text-3xl font-bold tracking-tight text-balance">
          Welcome back, {username}
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4 m-4">
        <div className="col-span-3">
          {/* 2-column course grid */}
          <div className="grid grid-cols-2 gap-4">
            {!loading && courses.length > 0 && (
              <Card className="col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      View your recent courses or navigate to the courses page to find a new course.
                    </CardTitle>
                    <Link to={"/courses"}>
                      <Button>Browse Courses</Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            )}

            {!loading && courses.length === 0 ? (
              <Card className="col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      Welcome to Vivan! Navigate to courses to get started.
                    </CardTitle>
                    <Link to={"/courses"}>
                      <Button>Browse Courses</Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ) : (
              // THIS IS THE EXISTING LIST
              !loading &&
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
              ))
            )}
          </div>
        </div>

        <div className="col-span-1 space-y-4">
          <Card className="p-4">
            <CardHeader >
              <CardTitle className="text-lg font-semibold">Achievments</CardTitle>
              <div className="space-y-3">
                {/* Only render if user exists AND streak is > 0 */}
                {user && user.streak > 0 && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="font-medium">
                      🏅 {user.streak}-Day Study Streak
                    </p>
                  </div>
                )}

                {/* Optional: Show this if they have NO streak */}
                {user && user.streak === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Achievements Coming Soon...
                  </p>
                )}
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
