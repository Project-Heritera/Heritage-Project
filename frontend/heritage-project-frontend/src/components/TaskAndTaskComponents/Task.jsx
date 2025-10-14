import PropTypes from "prop-types";
import { useEffect, useRef, useState, cloneElement } from "react";
import { CirclePlus } from "lucide-react";
Task.propTypes = {
  pointValue: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node,
};

function Task({ pointValue = 0, tags, children }) {
  const childRefs = useRef([]);
  
 
  {/*const childrenWithRefs = Array.isArray(children)
    ? children.map((child, i) =>
        child ? { ...child, ref: (el) => (childRefs.current[i] = el) } : null
      )
    : children;
 children.map((child, i) => 
     child ? React.cloneElement(child, { ref: (el) => (childRefs.current[i] = el) }) : null
   )*/}

     const childrenWithRefs = Array.isArray(children)
    ? children.map((child, i) =>
        child ? cloneElement(child, { ref: (el) => (childRefs.current[i] = el) }) : null
      )
    : children 
    ? cloneElement(children, { ref: (el) => (childRefs.current[0] = el) })
    : null;
  {/*const saveChildren = () => {
    console.log(children)
    
    const serialized = childRefs.current.map((ref) => ref?.serialize());
    console.log(serialized)
    Debug.log("Serialized children:", serialized);
    return serialized;
  };
  */}

  return (
    <div className="flex flex-col gap-4">
      {/* Task Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold">Task</h3>
          <p className="text-sm">Tags: {tags.join(", ")}</p>
          <p className="text-sm">Point Value: {pointValue}</p>
        </div>

        
      </div>

      {/* Task Components */}
      <div className="task-body flex flex-col gap-4">{childrenWithRefs}</div>

      {/* Add Component Button */}
      <button className="add-task-component flex items-center gap-2 border border-dashed px-3 py-2 rounded-md text-sm hover:border-gray-600 transition">
        <CirclePlus className="w-4 h-4" />
        Add Task Component
      </button>
    </div>
  );
}

export default Task;
