import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import api from "../../../services/api"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useEffect, useState } from "react";

function SearchBar({ includeUsers, includeCourses, usersAction, courseAction, searchFiller }) {
    const [open, setOpen] = useState(false)
    const [searchedUsers, setSearchedUsers] = useState([])
    const [searchedCourses, setSearchedCourses] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        //Return if query is empty
        if (searchQuery.length === 0) {
            setSearchedUsers([])
            return
        }
        setLoading(true)

        //Delay request
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await api.get(`/accounts/search/?user_prefix=${searchQuery}`)
                const userList = response.data;

                console.log("Userlist is:", userList)
                setSearchedUsers(userList)

                const courseResponse = await api.get(`/website/courses/search/?course_prefix=${searchQuery}`)
                const courseList = courseResponse.data;

                console.log("Courselist is:", courseList)
                setSearchedCourses(courseList)
            } catch (error) {
                console.error("Error retrieving searches:", error)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)

    }, [searchQuery])

    const onUserSelect = (user) => {
        usersAction(user)
    }

    const onCourseSelect = (course) => {
        courseAction(course)
    }

    return (
        <div className="relative w-full ">
            <Command className="rounded-lg border shadow-sm overflow-visible">
                <CommandInput
                    placeholder={searchFiller}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 200)}
                    onValueChange={setSearchQuery} />

                {open && (
                    <CommandList className="absolute top-12 w-full bg-background border rounded-md shadow-xl animate-in fade-in-0 zoom-in-95">
                        {loading && (
                            <div className="p-4 text-sm text-muted-foreground flex items-center justify-center">
                                Searching...
                            </div>
                        )}


                        <CommandEmpty>No results found.</CommandEmpty>

                        {includeUsers && (
                            <CommandGroup heading="Friends">
                                {/* Load Friends here */}
                                {searchedUsers.map((user) => (
                                    <CommandItem key={user.username} value={user.username} onSelect={() => onUserSelect(user)}>
                                        <div className="w-full flex items-center gap-2 cursor-pointer">
                                            <Avatar>
                                                <AvatarImage src={user.profile_pic} />
                                                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span>{user.username}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {includeCourses && (
                            <CommandGroup heading="Courses">
                                {/* Load Courses here */}
                                {searchedCourses.map((course) => (
                                    <CommandItem key={course.title} value={course.title} onSelect={() => onCourseSelect(course)}>
                                        <div className="w-full flex items-center gap-2 cursor-pointer">
                                            <Avatar>
                                                <AvatarImage src={course.image} />
                                                <AvatarFallback>{course.title.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span>{course.title}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                )}
            </Command>
        </div>
    )
}

export default SearchBar;