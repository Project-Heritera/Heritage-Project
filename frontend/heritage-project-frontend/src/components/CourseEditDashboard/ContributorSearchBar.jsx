import {
    Command,
    CommandInput,
} from "@/components/ui/command"

function LocalSearchBar({ onSearchChange, placeholder = "Filter list..." }) {
    return (
        <div className="relative w-full">
            {/* We keep the Command wrapper for the visual style (border, shadow, icon) */}
            <Command className="rounded-lg border shadow-sm overflow-visible">
                <CommandInput
                    placeholder={placeholder}
                    // strictly pass the value up to the parent
                    onValueChange={(value) => onSearchChange(value)} 
                />
            </Command>
        </div>
    )
}

export default LocalSearchBar;