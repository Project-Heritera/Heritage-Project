import { useState } from "react";
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

function ProfileEdit({currentName, currentBio, currentImage, children}) {
    //Store data for whats being edited
    const [bio, setBio] = useState(currentBio);
    const [name, setName] = useState(currentName);
    const [open, setOpen] = useState(false)


  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button>
                Edit Profile
            </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
        </DialogContent>
    </Dialog>
  )
}

export default ProfileEdit;