import { X } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../ui/input';

export const TagSelectionMenu = ({ onSelect, onClose, tagCatalogue }) => {
    const [search, setSearch] = useState("");

  const filteredTags = tagCatalogue.filter((tag) =>
    tag.toLowerCase().includes(search.toLowerCase())
  );
    return (
    <div className="space-y-4 text-foreground">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select a Tag</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
      </div>

      <Input
        placeholder="Search tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 bg-background text-foreground border-input"
      />

      <div className="max-h-60 overflow-y-auto space-y-1">
        {filteredTags.length > 0 ? (
          filteredTags.map((tag, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted"
              onClick={() => { onSelect(tag); onClose(); }}
            >
              {tag}
            </button>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-3">No tags found</p>
        )}
      </div>
    </div>
  );
}