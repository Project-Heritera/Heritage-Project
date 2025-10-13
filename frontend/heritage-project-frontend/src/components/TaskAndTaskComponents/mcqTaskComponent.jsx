import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { taskComponentTypes, getComponentTypeSchema } from "../../utils/taskComponentTypes";

MCQTaskComponent.propTypes = {
  serialize: PropTypes.func.isRequired,
  jsonData: PropTypes.string,
  isEditing: PropTypes.bool,
};

function MCQTaskComponent({ serialize, jsonData, isEditing}) {
  return (
    <div>
        <p>still need to implement</p>    </div>
  );
}
export default MCQTaskComponent;

