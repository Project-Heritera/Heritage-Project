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
import { Switch } from "@/components/ui/switch"


//Displays a list of cours given a room
function CourseDashboard() {
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false)
    const [tab, setTab] = useState("Security")
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

    const enable2FA = async () => {
        const response = await api.get(``)
    }

    const disable2FA = async () => {

    }

    const handle2FA = async () => {

    }

    if (loading) {
        return (<div>Loading...</div>)
    }

    return (

        <div className="flex flex-col w-full min-h-screen bg-gray-50">
            {/* Header Area */}
            <div className="w-full bg-white border-b px-6 py-4 mb-8">
                <div className="max-w-[60%] mx-auto">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Manage Your User Settings
                    </h2>
                </div>
            </div>

            {/* Main Content Area - Centered with max-width */}
            <div className="flex w-full max-w-[60%] mx-auto px-6 gap-10 items-start">

                {/* 1. SIDEBAR: Fixed width (e.g., w-64) */}
                <nav className="w-50 flex flex-col gap-2 text-sm text-muted-foreground">
                    <h3 className="font-semibold text-foreground mb-2 px-2">Account Managment</h3>
                    <Button variant={tab === "Account Settings" ? "default" : "ghost"} className="justify-start" onClick={()=> {setTab("Account Settings")}}>Account Settings</Button>
                    <Button variant={tab === "Security" ? "default" : "ghost"} className="justify-start" onClick={()=> {setTab("Security")}}>Security</Button>
                </nav>

                {/* 2. MAIN CONTENT: Flex-1 (Takes remaining space) */}
                <div className="flex-1">
                    {(tab === "Account Settings") && (
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
                                <div className="space-y-3 text-base ">
                                    <div className="flex justify-between ">
                                        <div className="flex items-center">
                                            <span className="font-bold text-gray-900 w-24">Name:</span>
                                            <span className="text-gray-700">{currentUser?.username || "claytakilerImperius"}</span>
                                        </div>
                                        <Button variant="outline">Change Username</Button>
                                    </div>

                                    <div className="flex justify-between ">
                                        <div className="flex items-center">
                                            <span className="font-bold text-gray-900 w-24">Email:</span>
                                            <span className="text-gray-700">{currentUser?.email}</span>
                                        </div>
                                        <Button variant="outline">Update Email</Button>
                                    </div>

                                    <div className="flex justify-between">
                                        <div className="flex items-center">
                                            <span className="font-bold text-gray-900 w-24">Password:</span>
                                            {/* Use static dots with wide tracking for a secure "masked" look */}
                                            <span className="text-gray-700 text-xl tracking-widest mt-1">••••••••••••</span>
                                        </div>
                                        <Button variant="outline">Change password</Button>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Security */}
                    {(tab === "Security") && (
                        <Card className="w-full shadow-sm">
                            <CardHeader className="bg-gray-50/50 border-b pb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Security</CardTitle>
                                        <CardDescription>
                                            Make changes to the security of your account.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="2fa-mode" className="text-base font-medium">
                                            Two-Factor Authentication
                                        </Label>
                                        <span className="text-sm text-muted-foreground">
                                            Add an extra layer of security to your account.
                                        </span>
                                    </div>
                                    <Switch
                                        id="2fa-mode"
                                        checked={is2FAEnabled}
                                        onCheckedChange={(checked) => setIs2FAEnabled(checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </div>
        </div>
    )
}

export default CourseDashboard;