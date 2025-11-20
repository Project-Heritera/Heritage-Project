import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Ellipsis } from "lucide-react"

function ProfileDropdown({items = [], menuTitle}) {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
                <Ellipsis className="h-5 w-5"/>
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>{menuTitle}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {items.map((item) => {
              return (
                <DropdownMenuItem key={item.label} onClick={item.action}>
                  {item.label}
                </DropdownMenuItem>
              )
            })}
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown;