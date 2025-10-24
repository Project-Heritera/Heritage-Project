import React from 'react';
import { taskComponentTypes } from '../../utils/taskComponentTypes';
/**
 * A modal-like component that presents a vertical list of buttons 
 * based on the task component types enum.
 * * @param {object} props
 * @param {function(string): void} props.onSelectTemplate - Callback function 
 * executed on button click, returning the enum key (e.g., 'SINGLE_CHOICE').
 * @param {function(): void} props.onClose - Function to close the modal.
 */
const TaskComponentSelectionMenu = ({ onSelectTemplate, onClose }) => {

  const componentKeys = Object.keys(taskComponentTypes);

  const handleButtonClick = (enumKey) => {
    onSelectTemplate(enumKey);
    onClose(); 
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="template-selection-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Select a Task Component Template</h2>
        <div className="button-list">
          {componentKeys.map((key) => (
            <button
              key={key}
              className="template-button"
              onClick={() => handleButtonClick(key)}
            >
              {taskComponentTypes[key]}
            </button>
          ))}
        </div>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default TaskComponentSelectionMenu;