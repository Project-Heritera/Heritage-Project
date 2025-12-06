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
import Enable2FA from "@/components/UserSettings/Enable2FA";
import Disable2FA from "@/components/UserSettings/Disable2FA";
import ChangePassword from "../components/UserSettings/ChangePassword"
import ChangeEmail from "@/components/UserSettings/ChangeEmail";
import ChangeUsername from "@/components/UserSettings/ChangeUsername";


//Displays a list of cours given a room
function UserSettings() {
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false)
    const [tab, setTab] = useState("Security")
    const [enable2FAOpen, setEnable2FAOpen] = useState(false)
    const [disable2FAOpen, setDisable2FAOpen] = useState(false)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    useEffect(() => {
        setLoading(true)

        const getData = async () => {
            try {
                //Get currently logged in user
                const currentUserResponse = await api.get('/accounts/user_info/')
                const currentUserData = currentUserResponse.data
                console.log("Current user data is:", currentUserData)
                setCurrentUser(currentUserData)
                setUsername(currentUserData.username)
                setEmail(currentUserData.email)
                //Get if 2FA is enabled
                const isEnabledResponse = await api.get(`/accounts/check_mfa_enabled/`)
                setIs2FAEnabled(isEnabledResponse.data.mfa_enabled)
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
        // changed bg-gray-50 to bg-muted/40 or bg-background
        <div className="flex flex-col w-full min-h-screen bg-muted/40">
            <Enable2FA
                open={enable2FAOpen}
                setOpen={setEnable2FAOpen}
                setChecked={setIs2FAEnabled}
            />
            <Disable2FA
                open={disable2FAOpen}
                setOpen={setDisable2FAOpen}
                setChecked={setIs2FAEnabled}
            />
            {/* Header Area: Changed bg-white to bg-background */}
            <div className="w-full bg-background border-b px-6 py-4 mb-8">
                <div className="max-w-[60%] mx-auto">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Manage Your User Settings
                    </h2>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full max-w-[60%] mx-auto px-6 gap-10 items-start">

                {/* SIDEBAR */}
                <nav className="w-50 flex flex-col gap-2 text-sm text-muted-foreground">
                    {/* Changed text-foreground */}
                    <h3 className="font-semibold text-foreground mb-2 px-2">Account Management</h3>
                    <Button variant={tab === "Account Settings" ? "default" : "ghost"} className="justify-start" onClick={() => { setTab("Account Settings") }}>Account Settings</Button>
                    <Button variant={tab === "Security" ? "default" : "ghost"} className="justify-start" onClick={() => { setTab("Security") }}>Security</Button>
                </nav>

                {/* MAIN CONTENT */}
                <div className="flex-1">
                    {(tab === "Account Settings") && (
                        <Card className="w-full shadow-sm">
                            {/* Changed bg-gray-50/50 to bg-muted/50 */}
                            <CardHeader className="bg-muted/50 border-b pb-4">
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
                                <div className="space-y-3 text-base pt-4">
                                    <div className="flex justify-between ">
                                        <div className="flex items-center">
                                            {/* Changed text-gray-900 to text-foreground */}
                                            <span className="font-bold text-foreground w-24">Username:</span>
                                            {/* Changed text-gray-700 to text-muted-foreground or text-foreground */}
                                            <span className="text-muted-foreground">{username && username}</span>
                                        </div>
                                        <ChangeUsername updateUser={setUsername} />
                                    </div>

                                    <div className="flex justify-between ">
                                        <div className="flex items-center">
                                            <span className="font-bold text-foreground w-24">Email:</span>
                                            <span className="text-muted-foreground">{email && email}</span>
                                        </div>
                                        <ChangeEmail updateEmail={setEmail} />
                                    </div>

                                    <div className="flex justify-between">
                                        <div className="flex items-center">
                                            <span className="font-bold text-foreground w-24">Password:</span>
                                            <span className="text-muted-foreground text-xl tracking-widest mt-1">••••••••••••</span>
                                        </div>
                                        <ChangePassword />
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {/* Security */}
                    {
                        (tab === "Security") && (
                            <Card className="w-full shadow-sm">
                                <CardHeader className="bg-muted/50 border-b pb-4">
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
                                            onCheckedChange={(checked) => {
                                                setIs2FAEnabled(checked);
                                                checked ? setEnable2FAOpen(true) : setDisable2FAOpen(true)
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default UserSettings;

