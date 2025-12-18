import { useState, useEffect } from "react";
import { get_tags } from "@/services/tags";
import { X } from "lucide-react";
import { Input } from "../ui/input";

export const TagSelectionMenu = ({ onSelect, onClose }) => {
  const [tagCatalogue, setTagCatalogue] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  //implement localStorage to prevent too many uneeded api calls
  const CACHE_KEY = "tags";
  const CACHE_TTL = 1000 * 60 * 20; // 20 minutes

  const fetchTags = async () => {
    setLoading(true);
    try {
      console.log("make api call for tags")
      const data = await get_tags();
      const tagNames = data.map((tag) => tag.name);
      setTagCatalogue(tagNames);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), tagNames })
      );
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, tagNames } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        setTagCatalogue(tagNames);
        return;
      }
    }

    fetchTags(); // fetch if no cache detected
  }, []);

  const filteredTags = tagCatalogue.filter((tag) =>
    tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 text-foreground">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select a Tag</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X />
        </button>
      </div>

      <Input
        placeholder="Search tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 bg-background text-foreground border-input"
      />

      <div className="max-h-60 overflow-y-auto space-y-1">
        {loading && tagCatalogue.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">
            Loading tags...
          </p>
        ) : filteredTags.length > 0 ? (
          filteredTags.map((tag, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-muted"
              onClick={() => {
                onSelect(tag);
                onClose();
              }}
            >
              {tag}
            </button>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-3">
            No tags found
          </p>
        )}
      </div>
    </div>
  );
};
