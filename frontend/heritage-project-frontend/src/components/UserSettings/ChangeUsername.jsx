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
import { AlertCircle } from "lucide-react"
import { tr } from "date-fns/locale";

function ChangeUsername({ updateUser}) {
    //Store data for whats being edited
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [open, setOpen] = useState(false)
    const [username, setUsername] = useState("")

    useEffect(() => {
        
    }, [])

    const makeChange = async () => {
        if (username.length === 0) {
            setError("username may not be empty.")
            return
        }

        try {
            const response = await api.put(`/accounts/update_user_info/`,
                {
                    username: username
                })
            const data = response.data
            console.log("username Change response was:", response)
            if (updateUser) updateUser(username)
            setOpen(close)
        } catch (error) {
            console.error("Error adding username:", error)
            setError("Server error. Please try again.")
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger>
                <Button variant="outline">Change Username</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[380px]">
                <DialogHeader>
                    <DialogTitle>Change Username</DialogTitle>
                    <DialogDescription>
                        Choose a new username.
                    </DialogDescription>
                </DialogHeader>

                {/* Form Content */}

                <div className="grid gap-4 py-4">

                    <div className="grid w-full items-center gap-1.5">

                        <Label htmlFor="2fa-code">New Username</Label>
                        <Input
                            id="2fa-code"
                            type="text"
                            placeholder="johndoe@gmail.com"
                            value={username}
                            onChange={(e) => {
                                const value = e.target.value;
                                setUsername(value)
                                if (error) setError("");
                            }}
                            className={`text-center tracking-widest text-lg ${error ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                        />
                        {error && (
                            <div className="flex items-center text-red-500 text-sm mt-1">

                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex justify-between w-full">
                        <div>
                            <Button
                                onClick={() => {
                                    setError("")
                                    setOpen(false);
                                }}
                                variant="outline">
                                Cancel
                            </Button>
                        </div>
                        <div>
                            <Button onClick={makeChange}>
                                Change Username
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ChangeUsername;