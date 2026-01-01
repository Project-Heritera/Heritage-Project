//Handle what the buttons look like for toolbar
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Debug } from "@/utils/debugLog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import SectionDescription from "./SectionDescription";
import RoomCard from "./RoomCard";
import { useEffect, useState } from "react";
import api from "@/services/api";

const SectionDropdown = ({ title, description, sectionId, courseId }) => {
    const [loading, setLoading] = useState(true)

    const [rooms, setRooms] = useState([])
    useEffect(() => {
        setLoading(true)
        const getRooms = async () => {
            try {
                const response = await api.get(`/website/sections/${sectionId}/rooms/`)
                const roomsData = response.data
                Debug.log("Retrieved course rooms:", roomsData)
                setRooms(roomsData)
            } catch (error) {
                console.error("Error retrieving course rooms: ", error)
            } finally {
                setLoading(false)
            }
        }
        getRooms();
    }, [])

    if (loading) {
        return (<div>Loading...</div>)
    }

    return (
        <Accordion type="single" collapsible className="w-full border rounded-lg shadow-sm">
            <AccordionItem value="item-1">
                <AccordionTrigger className="px-4 hover:no-underline  rounded-t-lg">
                    <span>{title}</span>
                </AccordionTrigger>

                <AccordionContent>
                    {/* Display Description of section */}
                    <div className="px-4 pt-2">
                        <SectionDescription description={description} />
                    </div>
                    {/* Display all rooms of section */}
                    <div className="flex flex-col gap-4 px-4 py-4">
                        {rooms && rooms.map((room) => {
                            if (room.can_edit == true){
                                return(
                                    <RoomCard key={room.title} navigateLink={`/re/${courseId}/${sectionId}/${room.room_id}`} title={room.title} description={room.description} imageLink={`${import.meta.env.VITE_API_URL_FOR_TEST}${room.image}`} progress={room.progress_percent}/>

                                )

                            }
                            else{
                                return(
                                    <RoomCard key={room.title} navigateLink={`/r/${courseId}/${sectionId}/${room.room_id}`} title={room.title} description={room.description} imageLink={`${import.meta.env.VITE_API_URL_FOR_TEST}${room.image}`} progress={room.progress_percent}/>
                                )
                            }
                        })}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default SectionDropdown;