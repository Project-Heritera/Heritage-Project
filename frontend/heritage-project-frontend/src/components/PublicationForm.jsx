import PropTypes from "prop-types";
import { React, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Debug } from "../utils/debugLog";
import { publish_room } from "../services/room";
import { create_course } from "@/services/course";
import { create_badge } from "@/services/badge";
import { useErrorStore } from "../stores/ErrorStore";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toFormData } from "axios";
PublicationForm.propTypes = {
  FormType: PropTypes.oneOf(["Course", "Section", "Room"]).isRequired,
  user_id: PropTypes.number.isRequired,
  room_id: PropTypes.number, //required if form type is course
};

function PublicationForm({ onClose, FormType, room_id, user_id }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();
  const [ isPublished, setIsPublished ] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "Access_To",
  });
 //for displaying status like error popup
  const showError = useErrorStore((state) => state.showError);

  const onSubmit = async (data) => {
    if (FormType=="Course"){ return handleCreateCourse(data)}
    else if (FormType=="Section"){ return handleCreateSection(data)}
    else if (FormType=="Room"){ return handleCreateRoom(data)}
  }
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
      Debug.error("Error in course.js or in course api at backend:", err);
      showError("Failed to Create Room") 
      return null;
    }
    try {
      const publish_data = new FormData()
      publish_data.append("title", data.title)
      publish_data.append("description", data.description)
    if (data.image && data.image[0]) {
        publish_data.append("image", data.image[0]);
      }
      if (badge_status && badge_status.badge_id) {
      publish_data.append("badge", badge_status.badge_id);
    }
      const course_status = await create_course(
        publish_data
      );
      setIsPublished(true)
      return course_status;
    } catch (err) {
      Debug.error("Error in course.js or in course api at backend:", err);
      showError("Failed to Create Room") 
      return null;
    }
  };


  const handleCreateRoom = async (data) => {
    Debug.log("form data is: ", data);
    try {
      const publish_data = {
        title: data.title,
        description: data.description,
        badge_title: data.badge_title,
        badge_icon: data.badge_icon,
      };
      const room_status = await publish_room(
        course_id,
        section_id,
        room_id,
        publish_data
      );
      setIsPublished(true)
      return room_status;
    } catch (err) {
      Debug.error("Error in room.js or in publish room api at backend:", err);
      showError("Failed to publish room") 
      return null;
    }
  };

  return (
  <>
    {isPublished ? (
      <Card className="p-6 text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-600 text-xl font-bold">
            Published successfully! You can now close.
          </CardTitle>
        </CardHeader>

        <CardFooter className="flex justify-center">
          <Button variant="destructive" onClick={onClose}>
            Close
          </Button>
        </CardFooter>
      </Card>
    ) : (
      <Card className="p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Create Post
          </CardTitle>
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
                {...register("description", { required: true, maxLength: 225 })}
              />
            </div>


            {/* BADGE TITLE */}
            <div className="space-y-2">
              <Label>Badge Title</Label>
              <Input
                type="text"
                placeholder="Badge Title"
                {...register("badge_title", { required: true, maxLength: 225 })}
              />
            </div>

            {/* BADGE DESCRIPTION */}
            <div className="space-y-2">
              <Label>Badge Description</Label>
              <Input
                type="text"
                placeholder="Badge Description"
                {...register("badge_description", { required: true, maxLength: 225 })}
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
            <Button type="submit" className="w-full">
              Create
            </Button>
          </form>
        </CardContent>
      </Card>
    )}
  </>
);
}
export default PublicationForm;
