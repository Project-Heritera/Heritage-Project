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
import ProfileImage from "./ProfileImage";
import { AspectRatio } from "@/components/ui/aspect-ratio"
import api from "../../services/api"

function ProfileEdit({ currentBio, currentImageUrl, setCurrentImageUrl, setCurrentBio}) {
    //Store data for whats being edited
    const [bio, setBio] = useState(currentBio);
    const [open, setOpen] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl);

    useEffect(() => {
        setBio(currentBio || "");
        setPreviewUrl(currentImageUrl || "");
    }, [currentBio, currentImageUrl])

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file."); // Or use a toast notification
                return;
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const saveChanges = async () => {
        console.log("Saving changes");
        //Submit chanegs to backend
        try {
            const formData = new FormData();

            let newDescription = bio
            if (!bio || bio == "") {
                newDescription="No Description"
            }
            formData.append("description", newDescription);

            if (imageFile) {
                formData.append("profile_pic", imageFile);
            }

            const response = await api.put("/accounts/update_user_info/", formData);

            console.log("Success uploading edits")

            if (response.data) {
                setCurrentBio(newDescription);
                setCurrentImageUrl(previewUrl);
            }
        } catch (error) {
            console.error("Error updating profile:", error)
        }
        //Close menu and set properities for users display
        setOpen(false);
    }


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
                    <DialogDescription>
                        Make changes to your profile description and image here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                {/* Form Content */}
                <div className="grid gap-4 py-4">
                    {/* Image Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-[60%]">
                            <AspectRatio ratio={1 / 1}>
                                <img src={previewUrl} alt="preview" className="rounded-md object-cover w-full h-full" />
                            </AspectRatio>
                        </div>
                        <Label htmlFor="picture">Profile Picture</Label>
                        <Input id="picture" type="file" onChange={handleImageChange} accept="image/*" />
                    </div>

                    {/* Description Textarea Section */}
                    <div className="grid gap-2">
                        <Label htmlFor="bio">Description</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="min-h-[100px] max-h-[200px] overflow-y-auto resize-none"
                        >
                            {currentBio}
                        </Textarea>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit" onClick={saveChanges}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ProfileEdit;