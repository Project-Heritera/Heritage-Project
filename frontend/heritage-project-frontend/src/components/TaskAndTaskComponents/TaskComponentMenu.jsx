import { X } from 'lucide-react';
import { taskComponentTypes } from '../../utils/taskComponentTypes';

export const TaskComponentMenu = ({ onSelect, onClose }) => {
const componentKeys = Object.keys(taskComponentTypes);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Select a Task Type</h2>
          <button onClick={onClose} className="">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-2">
          {componentKeys.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                onSelect(type);
                onClose();
              }}
              className="w-full text-left p-4"
            >
            {taskComponentTypes[type]}
              <div className="font-semibold ">{type.name}</div>
              <div className="text-sm mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};