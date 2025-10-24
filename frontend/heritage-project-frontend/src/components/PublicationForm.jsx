import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import PropTypes from "prop-types";
import {
  X,
  CheckCircle,
  Plus,
  Trash2,
  Shield,
  UploadCloud,
} from "lucide-react";
import { Debug } from "../utils/debugLog";
import { publish_room } from "../services/room";

function conditionalProps(props, propName, componentName) {
  //ensures that a course id is provided for course form type, course id and section id is provided for section, and all 3 ids are provided for room
  const { FormType, course_id, section_id, room_id } = props;

  const isInt = (val) => Number.isInteger(val) && val !== null;

  if (FormType === "Course" && !isInt(course_id)) {
    return new Error(
      `${componentName}: course_id must be an integer when FormType is 'Course'. Received ${course_id}`
    );
  }

  if (FormType === "Section" && (!isInt(course_id) || !isInt(section_id))) {
    return new Error(
      `${componentName}: both course_id and section_id must be integers when FormType is 'Section'.`
    );
  }

  if (
    FormType === "Room" &&
    (!isInt(course_id) || !isInt(section_id) || !isInt(room_id))
  ) {
    return new Error(
      `${componentName}: course_id, section_id, and room_id must be integers when FormType is 'Room'.`
    );
  }
  return null;
}
PublicationForm.propTypes = {
  FormType: PropTypes.oneOf(["Course", "Section", "Room"]).isRequired,
  course_id: conditionalProps,
  section_id: conditionalProps,
  room_id: conditionalProps,
};

function PublicationForm({ FormType, course_id, section_id, room_id }) {
  // Hooks are correctly called here. The original import issue is fixed.
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      tags: [{ value: "" }],
      badge_title: "",
      badge_icon: null,
    },
  });

  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tags",
  });

  const handleClose = () => {
    setIsPublished(false);
    reset(); //reset form fields
  };

  const onSubmit = async (data) => {
    Debug.log("form data is: ", data);
    setIsLoading(true);

    try {
      const publish_data = {
        title: data.title,
        description: data.description,
        // Flatten tags array from [{value: 'a'}, {value: 'b'}] to ['a', 'b']
        tags: data.tags.map((t) => t.value).filter((v) => v),
        badge_title: data.badge_title,
        // In a real app, badge_icon (a FileList) would be uploaded to storage
        badge_icon: data.badge_icon.length > 0 ? data.badge_icon[0].name : null,
      };

      let publish_status;
      if (FormType === "Room") {
        publish_status = await publish_room(
          course_id,
          section_id,
          room_id,
          publish_data
        );
      } else if (FormType === "Section") {
        publish_status = await publish_section(
          course_id,
          section_id,
          publish_data
        );
      } else if (FormType === "Course") {
        publish_status = await publish_course(course_id, publish_data);
      }

      setIsPublished(true);
      return publish_status;
    } catch (err) {
      Debug.error(`Failed to publish ${FormType}:`, err);
      //todo:dipslay error popup
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8 transition-all duration-300">
        {/* --- HEADER --- */}
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 flex items-center">
          <Shield className="w-7 h-7 mr-3 text-indigo-500" />
          Publish {FormType}
        </h1>
        <p className="text-gray-500 mb-6 border-b pb-4">
          Provide the following in order to make this {FormType} public.
        </p>

        {/* ---Loading animation-- */}
        {isLoading && (
          <div className="text-center p-6 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Publishing {FormType}...</span>
          </div>
        )}

        {/* ---When publish is successful-- */}
        {isPublished && (
          <div className="text-center p-8 bg-green-100 border-2 border-green-400 rounded-xl shadow-lg">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-xl font-bold text-green-700 mb-4">
              Published Successfully!
            </p>
            <p className="text-gray-600 mb-6">
              Your {FormType} is now available in the public catalog.
            </p>
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
            >
              <X className="w-5 h-5 inline mr-2" />
              Close Form
            </button>
          </div>
        )}
        {/* --- FORM --- */}
        {!isPublished && !isLoading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title{" "}
                <span className="text-xs text-gray-400">(Max 100 chars)</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder={`Enter title for the ${FormType}`}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                {...register("title", {
                  required: "Title is required",
                  maxLength: 100,
                })}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description{" "}
                <span className="text-xs text-gray-400">(Max 225 chars)</span>
              </label>
              <textarea
                id="description"
                rows="3"
                placeholder={`Provide a brief description of this ${FormType}`}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                {...register("description", {
                  required: "Description is required",
                  maxLength: 225,
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      {...register(`tags.${index}.value`)}
                      placeholder="e.g., math, beginner, quiz"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-full transition duration-150"
                      aria-label="Remove Tag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => append({ value: "" })}
                className="mt-3 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition duration-150"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Tag
              </button>
            </div>

            <div>
              <label
                htmlFor="badge_title"
                className="block text-sm font-medium text-gray-700"
              >
                Badge Title
              </label>
              <input
                id="badge_title"
                type="text"
                placeholder="e.g., Completion Badge"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                {...register("badge_title", {
                  required: "Badge Title is required",
                  maxLength: 225,
                })}
              />
            </div>

            <div>
              <label
                htmlFor="badge_icon"
                className="block text-sm font-medium text-gray-700"
              >
                Badge Icon
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition duration-150">
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  {...register("badge_icon")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white transition duration-200 ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {isLoading ? "Processing..." : `Publish ${FormType}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PublicationForm;
