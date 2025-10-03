import PropTypes from "prop-types";
import { safeParse } from "zod";
import { useState, useEffect } from "react";
import {taskComponentTypes, getComponentTypeSchema} from "../../utils/taskComponentTypes";
TextEditor.propTypes = {
  serialize: PropTypes.func.isRequired,
  unserializedData: PropTypes.string
};

function TextEditor(props) {
    const [text, setText] = useState("")
    //load unseralizedData into local states
    useEffect(() =>{
        //todo:if text field dosent exist, return an error and kill component
    })
    function handleSerialize(){}
  return (
    <div>
      <h1>This is a text component</h1>
    </div>
  );
}
export default TextEditor;