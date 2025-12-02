// This page is the render for the home page at the root

import CourseCard from "../components/CourseViewer/CourseCard";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useParams } from "react-router-dom";

// Helper for random progress
const rand = () => Math.random().toFixed(2);

export default function Home() {
  const { username } = useParams();

  return (
    <div className="flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="scroll-m-20 text-center text-3xl font-bold tracking-tight text-balance">
          Welcome back, {username}
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4 m-4">
        <div className="col-span-3">
          <Card className="p-4">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Highlighted Courses{" "}
            </h2>

            {/* 2-column course grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Example courses — same ones from your CourseView */}
              <CourseCard
                link="#"
                title="🌺 Creole | Kouri-Vini Language"
                description="Explore the roots of Louisiana Creole."
                progress={rand() * 100}
                imageLink="./src/assets/course_image_placeholder_1.png"
              />

              <CourseCard
                link="#"
                title="🌴 Standard Hawaiian Language"
                description="Learn pronunciation & history."
                progress={rand() * 100}
                imageLink="./src/assets/course_image_placeholder_2.png"
              />

              <CourseCard
                link="#"
                title="🏮 Lantern Building"
                description="Create your own lantern."
                progress={rand() * 100}
                imageLink="./src/assets/course_image_placeholder_3.png"
              />

              <CourseCard
                link="#"
                title="🌳 Ancestry Tree Cutout"
                description="Design a personalized ancestry tree."
                progress={rand() * 100}
                imageLink="./src/assets/course_image_placeholder_4.png"
              />
            </div>
          </Card>
        </div>

        <div className="col-span-1 space-y-4">
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
