import PropTypes from "prop-types";
import React, {
  useState,
  useEffect,
  ref,
  forwardRef,
  useImperativeHandle,
} from "react";

import { taskComponentTypes } from "../../../utils/taskComponentTypes";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Helper to convert base64 string to Image object
const base64ToImage = (base64) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};
const ImageTaskComponent = forwardRef(({ jsonData, isEditing }, ref) => {
  const [image, setImage] = useState(null); // Image object or base64 string
  const [alt, setAlt] = useState("");
  const [image_type, set_image_type] = useState("image/png"); // default type


  useImperativeHandle(ref, () => ({
    serialize: () => {
      return JSON.stringify({
        src: typeof image === "string" ? image : image?.src || "",
        alt,
        image_type: image_type
      });
    },
  }));

  useEffect(() => {
  if (jsonData) {
    try {
      const parsed = JSON.parse(JSON.stringify(jsonData));
      const { src, alt, image_type } = parsed;
      setAlt(alt || "");
      set_image_type(image_type)

      if (src) {
    setImage(src);
  }
    } catch (error) {
      console.error("Failed to parse initial image value:", error);
    }
  }
}, [jsonData]);


  // Handle file input change
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImage(base64String); // Store base64 string
    };
    set_image_type(file.type);
    reader.readAsDataURL(file);
  };

  const imageSrc = image ? `data:${image_type};base64,${image}` : "";

  return (
    <Card className="p-4">
      {isEditing ? (
        <div className="flex flex-col gap-4">
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          <Input
            placeholder="Alt text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {image && (
            <img
              src={imageSrc}
              alt={alt}
              className="max-w-full rounded-md"
            />
          )}
        </div>
      )}
    </Card>
  );
});
ImageTaskComponent.propTypes = {
  jsonData: PropTypes.string,
  isEditing: PropTypes.bool,
};

export default ImageTaskComponent;
