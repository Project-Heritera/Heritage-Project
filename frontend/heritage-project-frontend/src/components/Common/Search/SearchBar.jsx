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

function SearchBar({ includeUsers, includeCourses, usersAction }) {
    const [open, setOpen] = useState(false)
    const [searchedUsers, setSearchedUsers] = useState([])
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
            } catch (error) {
                console.error("Error retrieving searched users:", error)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)

    }, [searchQuery])

    const onUserSelect = (user) => {
        usersAction(user)
    }

    return (
        <div className="relative w-full max-w-lg z-50">
            <Command className="rounded-lg border shadow-sm overflow-visible">
                <CommandInput
                    placeholder="Search friends or courses..."
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

                        <CommandGroup heading="Friends">
                            {/* Load Friends here */}
                            {searchedUsers.map((user) => (
                                <CommandItem key={user.username} value={user.username}>
                                    <div className="w-full flex items-center gap-2 cursor-pointer" onClick={() => onUserSelect(user)}>
                                        <Avatar>
                                            <AvatarImage src={user.profile_pic} />
                                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.username}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        <CommandGroup heading="Courses">
                            {/* Load Courses here */}
                        </CommandGroup>
                    </CommandList>
                )}
            </Command>
        </div>
    )
}

export default SearchBar;