import { X } from 'lucide-react';
import { useState } from 'react';

export const TagSelectionMenu = ({ onSelect, onClose, tagCatalogue }) => {
    const [search, setSearch] = useState("");

  const filteredTags = tagCatalogue.filter((tag) =>
    tag.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <>
      <div
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Select a Tag</h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-3 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

        {/* Tag List */}
        <div className="max-h-60 overflow-y-auto space-y-1">
          {filteredTags.length > 0 ? (
              filteredTags.map((tag, index) => (
                  <button
                  key={index}
                  onClick={() => {
                      onSelect(tag);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                {tag}
              </button>
            ))
          ) : (
              <p className="text-gray-500 text-sm text-center py-3">
              No tags found
            </p>
          )}
        </div>
      </div>
    </>
  );
}