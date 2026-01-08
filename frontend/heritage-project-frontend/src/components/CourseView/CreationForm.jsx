import PropTypes from "prop-types";
import React, { useState } from "react"; // FIXED: Correct React import
import { useForm } from "react-hook-form"; // REMOVED: Unused useFieldArray
import { Debug } from "../../utils/debugLog";
import { create_course } from "@/services/course";
import { create_section } from "@/services/section";
import { create_room } from "../../services/room";
import { create_badge } from "@/services/badge";
import { useErrorStore } from "../../stores/ErrorStore";
import { useNavigate } from "react-router-dom";

// UI Imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Ensures we can open the modal
} from "../../components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function CreationForm({ FormType, course_id, section_id, submitCall }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control, // Kept in case you add useFieldArray back later
    reset, // Useful to reset form on close
  } = useForm();

  const [isCreated, setIsCreated] = useState(false);
  const showError = useErrorStore((state) => state.showError);

  // Reset form when modal closes
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Optional: Reset logic here if needed
      setTimeout(() => setIsCreated(false), 300);
    }
  };

  const onSubmit = async (data) => {
    if (FormType == "Course") {
      return handleCreateCourse(data);
    } else if (FormType == "Section") {
      return handleCreateSection(data);
    } else if (FormType == "Room") {
      return handleCreateRoom(data);
    }
  };

  const handleCreateCourse = async (data) => {
    let badge_status;
    try {
      const form_data = new FormData();
      form_data.append("title", data.badge_title);
      form_data.append("description", data.badge_description);
      if (data.badge_icon && data.badge_icon[0]) {
        form_data.append("image", data.badge_icon[0]);
      }
      badge_status = await create_badge(form_data);
    } catch (err) {
      Debug.error("Error in badge creation:", err);
      showError("Failed to Create Badge");
      return null;
    }
    try {
      const publish_data = new FormData();
      publish_data.append("title", data.title);
      publish_data.append("description", data.description);
      if (data.image && data.image[0]) {
        publish_data.append("image", data.image[0]);
      }
      if (badge_status && badge_status.badge_id) {
        publish_data.append("badge_id", badge_status.badge_id);
      }
      const course_status = await create_course(publish_data);
      setIsCreated(true);
      Debug.log("Course data is:", course_status);
      if (submitCall) {
        submitCall(course_status);
      }
      navigate(`/ce/${course_status.course_id}`);
      return course_status;
    } catch (err) {
      Debug.error("Error in course creation:", err);
      showError("Failed to Create Course");
      return null;
    }
  };

  const onClose = () => {
    setOpen(false);
    //force refresh to display updated content
  };
  const handleCreateSection = async (data) => {
    let badge_status;
    try {
      const form_data = new FormData();
      form_data.append("title", data.badge_title);
      form_data.append("description", data.badge_description);
      if (data.badge_icon && data.badge_icon[0]) {
        form_data.append("image", data.badge_icon[0]);
      }
      badge_status = await create_badge(form_data);
    } catch (err) {
      Debug.error("Error in badge creation:", err);
      showError("Failed to Create Badge");
      return null;
    }
    try {
      const publish_data = new FormData();
      publish_data.append("course", course_id);
      publish_data.append("title", data.title);
      publish_data.append("description", data.description);
      if (data.image && data.image[0]) {
        publish_data.append("image", data.image[0]);
      }
      if (badge_status && badge_status.badge_id) {
        publish_data.append("badge_id", badge_status.badge_id);
      }
      const section_status = await create_section(course_id, publish_data);
      setIsCreated(true);
      if (submitCall) {
        submitCall(section_status);
      }
      return section_status;
    } catch (err) {
      Debug.error("Error in section creation:", err);
      showError("Failed to Create Section");
      return null;
    }
  };

  const handleCreateRoom = async (data) => {
    let badge_status;
    try {
      const form_data = new FormData();
      form_data.append("title", data.badge_title);
      form_data.append("description", data.badge_description);
      if (data.badge_icon && data.badge_icon) {
        form_data.append("image", data.badge_icon[0]);
      }
      badge_status = await create_badge(form_data);
    } catch (err) {
      Debug.error("Error in badge creation:", err);
      showError("Failed to Create Badge");
      return null;
    }
    try {
      const publish_data = new FormData();
      publish_data.append("course", course_id);
      publish_data.append("section", section_id);
      publish_data.append("title", data.title);
      publish_data.append("description", data.description);
      if (data.image && data.image[0]) {
        publish_data.append("image", data.image[0]);
      }
      if (badge_status && badge_status.badge_id) {
        publish_data.append("badge_id", badge_status.badge_id);
      }
      const room_status = await create_room(
        course_id,
        section_id,
        publish_data
      );
      setIsCreated(true);
      if (submitCall) {
        submitCall(room_status);
      }
      return room_status;
    } catch (err) {
      Debug.error("Error in room creation:", err);
      showError("Failed to Create Room");
      return null;
    }
  };
  const getFormTypeExplanation = () => {
    switch (FormType) {
      case "Course":
        return "A course is the largest unit of content. It represents a full subject area and usually exists for each language or culture. Example: Haitian Creole, Standard Hawaiian.";
      case "Section":
        return "A section is a focused part of a course that groups related topics and learning goals. Sections typically contain problem sets and lessons centered around a theme. Examples: Introduction to culture and history; Greetings and noun phrases; Verb phrases and sentence structures; Common statements and foods; Technology-related vocabulary";
      case "Room":
        return "A room contains one or more tasks that users complete to practice or apply what’s covered in a section. Rooms should stay focused and concise, usually under 10 tasks, and fully align with the section’s topic. Example: In a Verb Phrases and Sentence Structure section, rooms might include: Verb phrase structure; Basic verb vocabulary; Asking questions Forming complex sentences";
      default:
        return "";
    }
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">Create New {FormType}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        {isCreated ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-green-600 text-center text-xl font-bold">
                Created Successfully!
              </DialogTitle>
              <DialogDescription className="text-center">
                Your {FormType} has been created.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button variant="destructive" onClick={() => onClose()}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          // FORM STATE
          <>
            <DialogHeader>
              <DialogTitle>Create {FormType}</DialogTitle>
              <DialogDescription>{getFormTypeExplanation()}</DialogDescription>
              <DialogDescription>
                Fill in the details below to create a new {FormType}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">{FormType} Title</Label>
                <Input
                  id="title"
                  placeholder="Enter Title"
                  {...register("title", { required: true, maxLength: 100 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{FormType} Description</Label>
                <Input
                  id="description"
                  placeholder="Enter Description"
                  {...register("description", {
                    required: true,
                    maxLength: 225,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">{FormType} Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  {...register("image")}
                />
              </div>
              <DialogHeader>
                <DialogDescription>
                  Fill in the details below to create a new badge for the{" "}
                  {FormType}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="badge_title">Badge Title</Label>
                <Input
                  id="badge_title"
                  placeholder="Enter Title"
                  {...register("badge_title", {
                    required: true,
                    maxLength: 225,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge_description">Badge Description</Label>
                <Input
                  id="badge_description"
                  placeholder="Enter Description"
                  {...register("badge_description", {
                    required: true,
                    maxLength: 225,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge_icon">Badge Icon</Label>
                <Input
                  id="badge_icon"
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  {...register("badge_icon")}
                />
              </div>
              <DialogFooter className="flex flex-row justify-between gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

CreationForm.propTypes = {
  FormType: PropTypes.oneOf(["Course", "Section", "Room"]).isRequired,
  room_id: PropTypes.number,
  section_id: PropTypes.number,
  course_id: PropTypes.number, // Added this as it was missing in propTypes
};

export default CreationForm;
