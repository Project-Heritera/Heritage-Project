import { useState } from "react";
import { List } from "lucide-react";
import CourseCard from "../components/CourseViewer/CourseCard";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Helper to generate a random progress value (0–1)
const rand = () => Math.random().toFixed(2);

const CourseView = () => {
  return (
    <>
      <div className="courses-view flex flex-col">
        <div className="courses-view-header flex  ">
          <h2 className="scroll-m-20  text-3xl font-semibold tracking-tight m-4">
            Course List
          </h2>
        </div>
        <Input type="text" placeholder="Search Courses" className="w-60 m-4" />

        <Card className="course-view-body flex flex-col p-4 m-4">
          <div className="course-view-body-body grid grid-cols-3 gap-4">
            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="🌺 Creole | Kouri-Vini Language"
              description="Explore the roots of Louisiana Creole and learn essential phrases used in everyday conversation. Perfect for beginners interested in cultural heritage."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_1.png"
            />

            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="🌴 Standard Hawaiian Language"
              description="Learn pronunciation, vocabulary, and the rich history behind the Hawaiian language. Begin your journey into one of the world's most melodic languages."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_2.png"
            />

            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="🏮 Lantern Building"
              description="Discover traditional lantern crafting techniques from across Asia. This hands-on course teaches you how to design and create your own lantern."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_3.png"
            />

            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="🌳 Ancestry Tree Cutout"
              description="Learn how to assemble a personalized ancestry tree using guided templates. A great creative project for families and heritage exploration."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_4.png"
            />

            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="🎭 Lost Icons | Louisiana"
              description="Explore forgotten cultural icons from Louisiana’s past and their impact on local history. A deep dive into art, folklore, and regional identity."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_5.png"
            />

            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="♻️ History of Recycling"
              description="Trace the evolution of recycling practices from ancient civilizations to the modern era. Learn how global efforts shape today’s sustainability challenges."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_6.png"
            />

                        <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="🌺 Creole | Kouri-Vini Language"
              description="Explore the roots of Louisiana Creole and learn essential phrases used in everyday conversation. Perfect for beginners interested in cultural heritage."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_1.png"
            />

            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="🌴 Standard Hawaiian Language"
              description="Learn pronunciation, vocabulary, and the rich history behind the Hawaiian language. Begin your journey into one of the world's most melodic languages."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_2.png"
            />

            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="🏮 Lantern Building"
              description="Discover traditional lantern crafting techniques from across Asia. This hands-on course teaches you how to design and create your own lantern."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_3.png"
            />

            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="🌳 Ancestry Tree Cutout"
              description="Learn how to assemble a personalized ancestry tree using guided templates. A great creative project for families and heritage exploration."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_4.png"
            />

            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="🎭 Lost Icons | Louisiana"
              description="Explore forgotten cultural icons from Louisiana’s past and their impact on local history. A deep dive into art, folklore, and regional identity."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_5.png"
            />

            <CourseCard
              link="https://youtu.be/dQw4w9WgXcQ?si=wcAqKqR5aXuu3R53"
              title="♻️ History of Recycling"
              description="Trace the evolution of recycling practices from ancient civilizations to the modern era. Learn how global efforts shape today’s sustainability challenges."
              progress={rand() * 100}
              imageLink="./src/assets/course_image_placeholder_6.png"
            />
          </div>
        </Card>
      </div>
    </>
  );
};

export default CourseView;
