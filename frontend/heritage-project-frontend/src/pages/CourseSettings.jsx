import SectionDropdown from "@/components/RoomsPage/SectionDropdown";
import { Debug } from "@/utils/debugLog";
import { useParams } from "react-router-dom";
import CourseCard from "@/components/CourseViewer/CourseCard";
import { progress } from "framer-motion";
import SectionsHolder from "@/components/RoomsPage/SectionsHolder";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import SearchBar from "@/components/Common/Search/SearchBar";
import ContributorCard from "../components/CourseEditDashboard/ContributorCard";
import ManageUser from "@/components/CourseEditDashboard/ManageUser";
import ContributorSearchBar from "../components/CourseEditDashboard/ContributorSearchBar";
//Displays a list of cours given a room
function CourseDashboard() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [owner, setOwner] = useState(null);

  const [sections, setSections] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    setLoading(true);

    const getData = async () => {
      try {
        //Get course data
        const courseResponse = await api.get(`/website/course/${courseId}/`);
        const courseData = courseResponse.data;
        //get owner
        const ownerName = courseData.creator;
        const courseOwner = await api.get(
          `/accounts/another_user_info/${ownerName}`,
        );
        setOwner(courseOwner.data);
        Debug.log("Course owner is:", courseOwner);
        Debug.log("Retrieved course data:", courseData);
        setCourseInfo(courseData);
        //Get sections
        const sectionsResponse = await api.get(
          `/website/courses/${courseId}/sections/`,
        );
        const sectionsData = sectionsResponse.data;
        Debug.log("Retrieved course sections:", sectionsData);
        setSections(sectionsData);
        //Get contributors
        const usersResponse = await api.get(
          `/website/get_course_editors/${courseId}/`,
        );
        const usersData = usersResponse.data;
        console.log("Retrieved users:", usersData);
        setUsers(usersData);
        //Get currently logged in user
        const currentUserResponse = await api.get("/accounts/user_info/");
        const currentUserData = currentUserResponse.data;
        console.log("Current user data is:", currentUserData);
        setCurrentUser(currentUserData);
      } catch (error) {
        console.error("Error retrieving course sections: ", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const removeUser = async (usernameToRemove) => {
    //Remove the user when trash is clicked on

    try {
      await api.delete(`/website/course/${courseId}/editors/remove/`, {
        data: {
          usernames: [usernameToRemove], // Send as a list, even for one person
        },
      });
      setUsers((prevUsers) =>
        prevUsers.filter((u) => (u.user || u.username) !== usernameToRemove),
      );
      console.log("Username to remove is:", usernameToRemove);
    } catch (error) {
      console.error("Error removing editor: ", error);
    }
    //Make backend call
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const filteredUsers = users.filter((user) => {
    // safely get the string, checking both possible keys
    const usernameString = user.user || user.username || "";

    return usernameString.toLowerCase().includes(filterQuery.toLowerCase());
  });

  const isOwner =
    currentUser &&
    owner &&
    (currentUser.user || currentUser.username === owner.user || owner.username);
  if (currentUser && owner) {
    console.log("Current user is:", currentUser.username || currentUser.user);
    console.log("Owner is set as:", owner.username || owner.user);
  }

  return (
    <div className="flex flex-col w-full min-h-screen ">
      {/* Header Area */}
      <div className="w-full border-b px-6 py-4 mb-8">
        <div className="max-w-[60%] mx-auto">
          <h2 className="text-2xl font-bold tracking-tight">
            Manage Your Course Settings
          </h2>
        </div>
      </div>

      {/* Main Content Area - Centered with max-width */}
      <div className="flex w-full max-w-[60%] mx-auto px-6 gap-10 items-start">
        {/* 1. SIDEBAR: Fixed width (e.g., w-64) */}
        <nav className="w-50 flex flex-col gap-2 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground mb-2 px-2">Access</h3>
          <Button variant="" className="justify-start">
            Collaborators
          </Button>
        </nav>

        {/* 2. MAIN CONTENT: Flex-1 (Takes remaining space) */}
        <div className="flex-1">
          <Card className="w-full shadow-sm">
            <CardHeader className="-50/50 border-b pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Collaborators</CardTitle>
                  <CardDescription>
                    Manage who has access to this course.
                  </CardDescription>
                </div>
                <ManageUser
                  courseId={courseId}
                  submitAction={(newUsers) => {
                    setUsers((prevUsers) => {
                      const uniqueNewUsers = newUsers.filter(
                        (newUser) =>
                          !prevUsers.some((existingUser) => {
                            const existingName =
                              existingUser.user || existingUser.username;
                            const newName = newUser.user || newUser.username;
                            console.log("New name is:", newName);
                            console.log("Old name is:", existingName);
                            return existingName === newName;
                          }),
                      );

                      // Return the combined list
                      return [...prevUsers, ...uniqueNewUsers];
                    });
                  }}
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="p-4 border-b flex items-center relative z-50">
                <div className="w-full">
                  <ContributorSearchBar
                    placeholder="Filter collaborators..."
                    onSearchChange={setFilterQuery}
                  />
                </div>
              </div>

              <div className="divide-y">
                {owner && (
                  <ContributorCard
                    key={owner.user || owner.username}
                    username={owner.user || owner.username}
                    description={"Owner"}
                    imageLink={`${import.meta.env.VITE_API_URL}${
                      owner.profile_pic
                    }`}
                  />
                )}
                {filteredUsers.map((user) => (
                  <ContributorCard
                    key={user.user || user.username}
                    username={user.user || user.username}
                    description={"Collaborator"}
                    onTrash={
                      isOwner
                        ? () => removeUser(user.user || user.username)
                        : undefined
                    }
                    imageLink={`${import.meta.env.VITE_API_URL}${
                      owner.profile_pic
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CourseDashboard;
