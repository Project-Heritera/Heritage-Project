import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"
import api from "@/services/api"

function PublishCourse({ isPublished, courseId }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)

        const getData = async () => {
            try {
            } catch (error) {

            } finally {
                setLoading(false)
            }
        }
        getData();
    }, [])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div>
                    <Button className="hover:shadow-lg transition-shadow cursor-pointer">
                        {isPublished ? "Make Private" : "Make Public"}
                    </Button>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[230px]">
                <DialogHeader>
                    <DialogTitle>{isPublished ? "Are you sure you want to make your course private?" : "Are you sure you want to publish?"}</DialogTitle>
                    <DialogDescription>
                        {isPublished ? "Privating your course will remove it and the rooms from the course page. However all obtained badges will remain in the users profile" : "Publishing your course will make all published rooms available to all users on the course page."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-between w-full">
                    <Button className="hover:shadow-lg transition-shadow cursor-pointer" variant="outline" onClick={() => {setOpen(false)}}>
                        No
                    </Button>

                    <Button className="hover:shadow-lg transition-shadow cursor-pointer">
                        Yes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default PublishCourse