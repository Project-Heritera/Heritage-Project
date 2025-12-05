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
import { Label } from "@/components/ui/label"


//Displays a list of cours given a room
function CourseDashboard() {
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        setLoading(true)

        const getData = async () => {
            try {
                //Get currently logged in user
                const currentUserResponse = await api.get('/accounts/user_info/')
                const currentUserData = currentUserResponse.data
                console.log("Current user data is:", currentUserData)
                setCurrentUser(currentUserData)
            } catch (error) {
                console.error("Error retrieving user info: ", error)
            } finally {
                setLoading(false)
            }
        }
        getData();
    }, [])

    if (loading) {
        return (<div>Loading...</div>)
    }

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
                    <h3 className="font-semibold text-foreground mb-2 px-2">Account Managment</h3>
                    <Button variant="" className="justify-start">Account Settings</Button>
                </nav>

                {/* 2. MAIN CONTENT: Flex-1 (Takes remaining space) */}
                <div className="flex-1">
                    <Card className="w-full shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Account Info</CardTitle>
                                    <CardDescription>
                                        Make changes to your account info.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-3 text-base">
                                <div className="flex justify-between ">
                                    <div className="flex items-center">
                                        <span className="font-bold text-gray-900 w-24">Name:</span>
                                        <span className="text-gray-700">{currentUser?.name || "claytakilerImperius"}</span>
                                    </div>
                                    <Button>Change Username</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default CourseDashboard;