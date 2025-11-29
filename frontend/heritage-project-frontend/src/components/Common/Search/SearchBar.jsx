import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"

import { useState } from "react";

function SearchBar({ image, title, description }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="relative w-full max-w-lg z-50">
            <Command className="rounded-lg border shadow-sm overflow-visible">
                <CommandInput placeholder="Search friends or courses..." onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)} />

                {open && (
                    <CommandList className="absolute top-12 w-full bg-background border rounded-md shadow-xl animate-in fade-in-0 zoom-in-95">
                        <CommandEmpty>No results found.</CommandEmpty>

                        <CommandGroup heading="Friends">
                            {/* Load Friends here */}
                        </CommandGroup>

                        <CommandGroup heading="Courses">
                            {/* Load Courses here */}
                        </CommandGroup>
                    </CommandList>
                )}
            </Command>
        </div>
    )
}

export default SearchBar;