import PropTypes from "prop-types";
import { React, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Debug } from "../utils/debugLog";
import { publish_room } from "../services/room";
import { useErrorStore } from "../stores/ErrorStore";
PublicationForm.propTypes = {
  FormType: PropTypes.oneOf(["Course", "Section", "Room"]).isRequired,
  course_id: PropTypes.number.isRequired,
  section_id: PropTypes.number,
  room_id: PropTypes.number,
};

function PublicationForm({ FormType, course_id, section_id, room_id }) {
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

  const handleClose = () => {
    // close modal. Logic should be provided by parent
  };
  const onSubmit = async (data) => {
    Debug.log("form data is: ", data);
    try {
      const publish_data = {
        title: data.title,
        description: data.description,
        tags: data.tags,
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
      Debug.error("Error in room.js or in pbulish room api at backend:", err);
      showError("Failed to publish room") 
      return null;
    }
  };

  return (
    <>
      {isPublished ? (
 
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
            position: "relative",
          }}
        >
          <p
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "green",
              marginBottom: "1.5rem",
            }}
          >
            Published successfully! You can now close.
          </p>
          <button
            onClick={handleClose}
            style={{
              backgroundColor: "red",
              color: "white",
              border: "none",
              padding: "0.6em 1.2em",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Close
          </button>
        </div>
      
      ) : (
   <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <p>Title</p>
              <input
                type="text"
                placeholder="Title"
                {...register("title", { required: true, maxLength: 100 })}
              />
            </div>
            <div>
              <p>Description</p>
              <input
                type="text"
                placeholder="Description"
                {...register("description", { required: true, maxLength: 225 })}
              />
            </div>
            <div>
              <p>Tags</p>
              {fields.map((field, index) => (
                <div key={field.id} className="dynamic-field">
                  <input
                    {...register(`tags.${index}.value`)}
                    placeholder="tag"
                  />
                  <button type="button" onClick={() => remove(index)}>
                    Delete
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => append({ value: "" })}>
                Add Tag
              </button>
            </div>
            <div>
              <p>Badge Title</p>
              <input
                type="text"
                placeholder="Badge_Title"
                {...register("badge_title", { required: true, maxLength: 225 })}
              />
            </div>

            <div>
              <p>Badge Icon</p>
              <input
                type="file"
                accept=".jpg, .jpeg, .png"
                {...register("badge_icon")}
              />
            </div>
            <input type="submit" />
          </form>
        </div>       
     )}
    </>
  );
}
export default PublicationForm;
