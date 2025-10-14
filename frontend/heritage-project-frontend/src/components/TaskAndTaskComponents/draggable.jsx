//This is the Wrapper for our Task Components to make them draggable within editor
import { GripVertical, Trash } from 'lucide-react';
import { TASK_TYPES } from './task_components';

export const Draggable = ({ card, index, onDragStart, onDragOver, onDrop, isDragging, onUpdate, onDelete }) => {
  const taskType = TASK_TYPES.find(type => type.id === card.type);
  const Component = taskType?.component;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={` rounded-lg shadow-md p-4 mb-3 cursor-grabbing transition-all duration-200 ${
        isDragging === index ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="text-gray-400 mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing" size={20} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">{taskType?.name}</span>
            <button
              onClick={() => onDelete(card.id)}
              className="text-gray-400 transition-colors"
            >
              <Trash size={18} />
            </button>
          </div>
          {Component && <Component questionData={card.data} onUpdate={(newData) => onUpdate(card.id, newData)} />}
        </div>
      </div>
    </div>
  );
};