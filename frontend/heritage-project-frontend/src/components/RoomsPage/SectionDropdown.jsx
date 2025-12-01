//Handle what the buttons look like for toolbar
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import SectionDescription from "./SectionDescription";
import RoomCard from "./RoomCard";
const SectionDropdown = ({ title, description, rooms }) => {
    return (
        <Accordion type="single" collapsible className="w-full border rounded-lg shadow-sm">
            <AccordionItem value="item-1">
                <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50 rounded-t-lg">
                    <span>Section 1</span>
                </AccordionTrigger>

                <AccordionContent>
                    {/* Display Description of section */}
                    <div className="px-4 pt-2">
                        <SectionDescription description={description} />
                    </div>
                    {/* Display all rooms of section */}
                    <div className="flex flex-col gap-4 px-4 py-4">
                        {rooms && rooms.map((room) => (
                            <RoomCard key={room.title} title={room.title} description={"This is a random description to be added right now"}/>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default SectionDropdown;