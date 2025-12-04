import { Menu, Settings, LogOut, User } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { USER_NAME } from "@/services/LocalStorage";
import SearchBar from "@/components/Common/Search/SearchBar";
import { useEffect, useState } from "react";
import api from "@/services/api";
import {useLogout} from "../../services/logout"
import { ModeToggle } from "@/components/mode-toggle";

function NavbarDropDown() {
    const user = localStorage.getItem(USER_NAME)
    const navigate = useNavigate();
    const [userObject, setUserObject] = useState(null)
    const performLogout = useLogout();
    const location = useLocation();

    useEffect(() => {
        const getUserData = async () => {
            if (!user) {
                return
            }
            try {
                const response = await api.get("/accounts/user_info/")
                const userData = response.data
                console.log("user object is:", userData)
                setUserObject(userData)
            } catch (error) {
                console.error("Error geting user object: ", error)
            }
        }
        getUserData();
    }, [user, useLocation])

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Menu className="" strokeWidth={2.5} />
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                        Navigate through Vivan
                    </SheetDescription>
                </SheetHeader>

                {/* Add search bar */}
                <div className="px-6 mt-4">
                    <SearchBar
                        includeUsers={true}
                        usersAction={(selectedUser) => {
                            console.log("Navigating to users page")
                            navigate(`/u/${selectedUser.username}`)
                        }}
                        includeCourses={true}
                        courseAction={(course) => {
                            console.log("Navigating to course")//Add functionality here!
                            navigate(`/c/${course.course_id || "#"}`);
                        }}
                        searchFiller={"Search courses or users"}
                    />
                </div>
                {/* Links go here */}
                <div className="flex flex-col gap-4 mt-8 px-6">
                    <Link to="/home" className="text-lg font-medium hover:text-primary">
                        HOME
                    </Link>
                    <Link to="/courses" className="text-lg font-medium hover:text-primary">
                        COURSES
                    </Link>
                    <Link to="/create" className="text-lg font-medium hover:text-primary">
                        CREATE
                    </Link>
                    <Link to="/about" className="text-lg font-medium hover:text-primary">
                        ABOUT
                    </Link>

                </div>

                {/* User Section */}
                {userObject && (
                    <div className="mt-auto px-6 mb-6">
                        {/* Account Info */}
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <Avatar>
                                <AvatarImage src={`${import.meta.env.VITE_API_URL_FOR_TEST}${userObject.profile_pic}`} />
                                <AvatarFallback>{user && user.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{user}</p>
                                <p className="text-xs text-muted-foreground">account</p>
                            </div>
                        </div>
                        {/* Account Actions */}
                        <div className="flex flex-col gap-2 ">
                            <ModeToggle/>
                            <Link to="/settings" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent text-sm">
                                <Settings className="h-4 w-4" /> Settings
                            </Link>
                        
                            <Link to={`/u/${user}`} className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent text-sm">
                                <User className="h-4 w-4" /> Profile
                            </Link>
                            <button className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-red-100 text-red-600 text-sm w-full text-left" onClick={performLogout}>
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default NavbarDropDown;