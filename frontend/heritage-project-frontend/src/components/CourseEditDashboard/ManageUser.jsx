import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import api from "../../services/api"
import SearchBar from "../Common/Search/SearchBar";
import ContributorCard from "./ContributorCard"

function ManageUser({ submitAction }) {
    //Store data for whats being edited
    const [open, setOpen] = useState(false)
    const [users, setUsers] = useState([])
    const saveChanges = async () => {
        if (users.length === 0) return;
        console.log("Saving changes");
        //Add the selected users to the backend and fill them in the parent
        const payload = {
            usernames: users.map((user) => user.username)
        };

        try {
           // await api.post(`/website/add_multiple_editor/room/${roomId}/`, payload);
            submitAction(users)

            setUsers([])
            setOpen(false);
            console.log("Finished adding contributors")
        } catch (error) {
            console.error("Failed to add editors:", error);
        }
    }

    const removeUser = async (userToRemove) => {
        //Remove the user when trash is clicked on
        setUsers((prevUsers) => prevUsers.filter((u) => u.username !== userToRemove.username));
        //Make backend call
    }



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    Add People
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                    <DialogDescription>
                        Invite a user to contribute openly to your course.
                    </DialogDescription>
                </DialogHeader>

                {/* Form Content */}
                <div className="grid gap-4 py-4">
                    {/* Search user then add them to list of people that are added after clicking invite user */}
                    <div className="relative z-50">
                        <SearchBar
                            includeUsers={true}
                            usersAction={(user) => {
                                //Add to section with users
                                const isDuplicate = users.some((u) => u.username === user.username);
                                console.log("Adding user")
                                if (!isDuplicate) {
                                    //Add the new user to the existing array
                                    setUsers((prevUsers) => [...prevUsers, user]);
                                }

                            }}
                        />
                    </div>

                    {/* Div holding selected users*/}
                    <div>
                        {users.map((user) => (
                            <ContributorCard key={user.username} username={user.username} description={"Invite to collaborate"} onTrash={() => removeUser(user)} />
                        ))}
                    </div>


                </div>

                <DialogFooter>
                    <Button type="submit" onClick={saveChanges}>Invite User</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ManageUser;