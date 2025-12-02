import PropTypes from "prop-types";
import { React, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Debug } from "../utils/debugLog";
import { create_course } from "@/services/course";
import { create_section } from "@/services/section";
import { create_room } from "../services/room";
import { create_badge } from "@/services/badge";
import { useErrorStore } from "../stores/ErrorStore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toFormData } from "axios";
CreationForm.propTypes = {
  FormType: PropTypes.oneOf(["Course", "Section", "Room"]).isRequired,
  room_id: PropTypes.number,
  section_id: PropTypes.number,
};

function CreationForm({ onClose, FormType, course_id, section_id }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();
  const [isCreated, setIsCreated] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "Access_To",
  });
  //for displaying status like error popup
  const showError = useErrorStore((state) => state.showError);

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
    //create badge for course first
    let badge_status;
    try {
      const form_data = new FormData();
      form_data.append("title", data.badge_title);
      form_data.append("description", data.badge_description);
      if (data.badge_icon && data.badge_icon[0]) {
        form_data.append("icon", data.badge_icon[0]);
      }
      badge_status = await create_badge(form_data);
    } catch (err) {
      Debug.error("Error in badge creation:", err);
      showError("Failed to Create Room");
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
        publish_data.append("badge", badge_status.badge_id);
      }
      const course_status = await create_course(publish_data);
      setIsCreated(true);
      return course_status;
    } catch (err) {
      Debug.error("Error in course.js or in course api at backend:", err);
      showError("Failed to Create Course");
      return null;
    }
  };

  const handleCreateSection = async (data) => {
    //create badge for course first
    let badge_status;
    try {
      const form_data = new FormData();
      form_data.append("title", data.badge_title);
      form_data.append("description", data.badge_description);
      if (data.badge_icon && data.badge_icon[0]) {
        form_data.append("icon", data.badge_icon[0]);
      }
      badge_status = await create_badge(form_data);
    } catch (err) {
      Debug.error("Error in badge creation:", err);
      showError("Failed to Create Room");
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
        publish_data.append("badge", badge_status.badge_id);
      }
      const section_status = await create_section(course_id, publish_data);
      setIsCreated(true);
      return section_status;
    } catch (err) {
      Debug.error("Error in section.js or in section api at backend:", err);
      showError("Failed to Section");
      return null;
    }
  };

  const handleCreateRoom = async (data) => {
    //create badge for course first
    let badge_status;
    try {
      const form_data = new FormData();
      form_data.append("title", data.badge_title);
      form_data.append("description", data.badge_description);
      if (data.badge_icon && data.badge_icon[0]) {
        form_data.append("icon", data.badge_icon[0]);
      }
      badge_status = await create_badge(form_data);
    } catch (err) {
      Debug.error("Error in badge creation:", err);
      showError("Failed to Create Room");
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
        publish_data.append("badge", badge_status.badge_id);
      }
      const room_status = await create_room(
        course_id,
        section_id,
        publish_data
      );
      setIsCreated(true);
      return room_status;
    } catch (err) {
      Debug.error("Error in section.js or in section api at backend:", err);
      showError("Failed to Create Room");
      return null;
    }
  };

  return (
    <>
      {isCreated ? (
        <Card className="p-6 text-center shadow-lg">
          <CardFooter>
            <CardTitle className="text-green-600 text-xl font-bold">
              Created Successfully! You can now close.
            </CardTitle>
          </CardFooter>

          <CardFooter className="flex justify-center">
            <Button variant="destructive" onClick={onClose}>
              Close
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="p-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Create Post</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* TITLE */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  type="text"
                  placeholder="Title"
                  {...register("title", { required: true, maxLength: 100 })}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  type="text"
                  placeholder="Description"
                  {...register("description", {
                    required: true,
                    maxLength: 225,
                  })}
                />
              </div>

              {/* BADGE TITLE */}
              <div className="space-y-2">
                <Label>Badge Title</Label>
                <Input
                  type="text"
                  placeholder="Badge Title"
                  {...register("badge_title", {
                    required: true,
                    maxLength: 225,
                  })}
                />
              </div>

              {/* BADGE DESCRIPTION */}
              <div className="space-y-2">
                <Label>Badge Description</Label>
                <Input
                  type="text"
                  placeholder="Badge Description"
                  {...register("badge_description", {
                    required: true,
                    maxLength: 225,
                  })}
                />
              </div>

              {/* BADGE ICON */}
              <div className="space-y-2">
                <Label>Badge Icon</Label>
                <Input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  {...register("badge_icon")}
                />
              </div>
              <div className="space-y-2">
                <Label>{FormType} Image</Label>
                <Input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  {...register("image")}
                />
              </div>
              {/* SUBMIT */}
              {/* SUBMIT + LEAVE BUTTON */}
              <div className="flex justify-between gap-4">
                <Button type="submit" className="flex-1">
                  Create
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Leave
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
export default CreationForm;
