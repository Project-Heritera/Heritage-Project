import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { CirclePlus } from "lucide-react";
Task.propTypes = {
  pointValue: PropTypes.number.isRequired, 
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node
};

function Task({ pointValue=0, tags, children }) {
  const childRefs = useRef([]);
    const childrenWithRefs = Array.isArray(children)
        ? children.map((child, i) =>
            child
            ? { ...child, ref: (el) => (childRefs.current[i] = el) }
            : null
        )
        : children;  

    const saveChildren = () => {
        const serialized = childRefs.current.map((ref) => ref?.serialize());
        Debug.log("Serialized children:", serialized);
        return serialized;
    };

 return (
    <div>
    <h3>Task</h3>
      <p>Tags: {tags.join(", ")}</p>
      <p>Point Value: {pointValue}</p>
      <button onClick={saveChildren}>Save Children</button>
      <div className="task-body">{childrenWithRefs}</div>
              <button className="add-task-component">
                <CirclePlus />
                Add task component
              </button>
    </div>
  );
}

export default Task;