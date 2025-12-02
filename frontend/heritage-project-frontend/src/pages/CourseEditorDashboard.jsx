import SectionDropdown from "@/components/RoomsPage/SectionDropdown";
import { useParams } from "react-router-dom";
import CourseCard from "@/components/CourseViewer/CourseCard";
import { progress } from "framer-motion";
import SectionsHolder from "@/components/RoomsPage/SectionsHolder";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import SearchBar from "@/components/Common/Search/SearchBar";
import ContributorCard from "../components/CourseEditDashboard/ContributorCard"
import ManageUser from "@/components/CourseEditDashboard/ManageUser";
import ContributorSearchBar from "../components/CourseEditDashboard/ContributorSearchBar"
//Displays a list of cours given a room
function CourseDashboard() {
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])
    const [filterQuery, setFilterQuery] = useState("")

    const [sections, setSections] = useState([])
    const [courseInfo, setCourseInfo] = useState(null)
    useEffect(() => {
        setLoading(true)

        const getData = async () => {
            try {
                //Get course data
                const courseResponse = await api.get(`/website/course/${courseId}/`)
                const courseData = courseResponse.data
                console.log("Retrieved course data:", courseData)
                setCourseInfo(courseData)
                //Get sections
                const sectionsResponse = await api.get(`/website/courses/${courseId}/sections/`)
                const sectionsData = sectionsResponse.data
                console.log("Retrieved course sections:", sectionsData)
                setSections(sectionsData)
            } catch (error) {
                console.error("Error retrieving course sections: ", error)
            } finally {
                setLoading(false)
            }
        }
        getData();
    }, [])

    const removeUser = async (userToRemove) => {
        //Remove the user when trash is clicked on
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToRemove.id));
        //Make backend call
    }

    if (loading) {
        return (<div>Loading...</div>)
    }

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(filterQuery.toLowerCase())
    );

    return (

        <div className="flex flex-col w-full min-h-screen bg-gray-50">
            {/* Header Area */}
            <div className="w-full bg-white border-b px-6 py-4 mb-8">
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
                    <Button variant="" className="justify-start">Collaborators</Button>
                    <Button variant="ghost" className="justify-start">Moderation</Button>

                    <h3 className="font-semibold text-foreground mt-4 mb-2 px-2">Code</h3>
                    <Button variant="ghost" className="justify-start">Branches</Button>
                    <Button variant="ghost" className="justify-start">Tags</Button>
                </nav>

                {/* 2. MAIN CONTENT: Flex-1 (Takes remaining space) */}
                <div className="flex-1">
                    <Card className="w-full shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Collaborators</CardTitle>
                                    <CardDescription>
                                        Manage who has access to this course.
                                    </CardDescription>
                                </div>
                                <ManageUser submitAction={(newUsers) => {
                                    setUsers((prevUsers) => {
                                        // 1. Filter out users that are ALREADY in the parent list to avoid duplicates
                                        const uniqueNewUsers = newUsers.filter(
                                            (newUser) => !prevUsers.some((existingUser) => existingUser.id === newUser.id)
                                        );

                                        // 2. Return the combined list
                                        return [...prevUsers, ...uniqueNewUsers];
                                    });
                                }} />
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="p-4 border-b flex items-center relative z-50">
                                <div className="w-full">
                                    <ContributorSearchBar 
                                    placeholder="Filter collaborators..."
                                        onSearchChange={setFilterQuery} />
                                </div>
                            </div>

                            <div className="divide-y">
                                {filteredUsers.map((user) => (
                                    <ContributorCard key={user.username} username={user.username} description={"Collaborator"} onTrash={removeUser} />
                                ))}
                                <ContributorCard username={"Chad Noris"} description={"Collaborator"} />
                                <ContributorCard username={"Bob Iger"} description={"Collaborator"} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default CourseDashboard;