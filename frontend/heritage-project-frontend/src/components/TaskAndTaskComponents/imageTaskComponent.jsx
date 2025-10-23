import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { taskComponentTypes, getComponentTypeSchema } from "../../utils/taskComponentTypes";

ImageTaskComponent.propTypes = {
  serialize: PropTypes.func.isRequired,
  jsonData: PropTypes.string,
  isEditing: PropTypes.bool,
};

function ImageTaskComponent({ serialize, jsonData, isEditing}) {
  return (
    <div>
        <p>still need to implement</p>    </div>
  );
}
export default ImageTaskComponent;

