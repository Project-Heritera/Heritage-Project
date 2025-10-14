import PropTypes from "prop-types";
import { useEffect, useRef, useState, cloneElement } from "react";
import { CirclePlus } from "lucide-react";
import { GripVertical, Trash } from "lucide-react";

Task.propTypes = {
  pointValue: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node,
};

function Task({index, onDragStart, onDragOver, onDrop, isDragging, pointValue = 0, tags, children, onDelete }) {
  const childRefs = useRef([]);

  {
    /*const childrenWithRefs = Array.isArray(children)
    ? children.map((child, i) =>
        child ? { ...child, ref: (el) => (childRefs.current[i] = el) } : null
      )
    : children;
 children.map((child, i) => 
     child ? React.cloneElement(child, { ref: (el) => (childRefs.current[i] = el) }) : null
   )*/
  }

  const childrenWithRefs = Array.isArray(children)
    ? children.map((child, i) =>
        child
          ? cloneElement(child, { ref: (el) => (childRefs.current[i] = el) })
          : null
      )
    : children
    ? cloneElement(children, { ref: (el) => (childRefs.current[0] = el) })
    : null;
  {
    /*const saveChildren = () => {
    console.log(children)
    
    const serialized = childRefs.current.map((ref) => ref?.serialize());
    console.log(serialized)
    Debug.log("Serialized children:", serialized);
    return serialized;
  };
  */
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={` rounded-lg shadow-md p-4 mb-3 cursor-grabbing transition-all duration-200 ${
        isDragging === index ? "opacity-50 scale-95" : "opacity-100 scale-100"
      } hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <GripVertical
          className="text-gray-400 mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing"
          size={20}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => onDelete(card.id)}
              className="text-gray-400 transition-colors"
            >
              <Trash size={18} />
            </button>
          </div>

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
            <div className="task-body flex flex-col gap-4">
              {childrenWithRefs}
            </div>

            {/* Add Component Button */}
            <button className="add-task-component flex items-center gap-2 border border-dashed px-3 py-2 rounded-md text-sm hover:border-gray-600 transition">
              <CirclePlus className="w-4 h-4" />
              Add Task Component
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Task;
