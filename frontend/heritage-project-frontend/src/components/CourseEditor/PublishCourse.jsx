import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import api from "@/services/api";

function PublishCourse({
  isPublished,
  courseId,
  onSuccess,
  buttonSize = "default",
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState(isPublished);

  const handlePublish = async () => {
    try {
      const response = await api.put(`/website/publish_course/${courseId}/`);
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
      setPublished(!published);
    } catch (error) {
      alert("Error Publishing course. Try again latter.");
      console.error("Error publishing course:", error);
    }
  };

  const handlePrivate = async () => {
    try {
      const response = await api.put(`/website/private_course/${courseId}/`);
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
      setPublished(!published);
    } catch (error) {
      alert("Error privating course. Try again latter.");
      console.error("Error publishing course:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Button
            size={buttonSize}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            {published ? "Make Private" : "Make Public"}
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {published
              ? "Are you sure you want to make your course private?"
              : "Are you sure you want to publish?"}
          </DialogTitle>
          <DialogDescription>
            {published
              ? "Privating your course will remove it and the rooms from the course page. However all obtained badges will remain in the users profile"
              : "Publishing your course will make all published rooms available to all users on the course page."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-around w-full">
          <Button
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={published ? handlePrivate : handlePublish}
          >
            Yes
          </Button>
          <Button
            className="hover:shadow-lg transition-shadow cursor-pointer"
            variant="outline"
            onClick={() => {
              setOpen(false);
            }}
          >
            No
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PublishCourse;
