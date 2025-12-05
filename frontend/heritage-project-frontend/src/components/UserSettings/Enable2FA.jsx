import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import api from "../../services/api"

function Enable2FA({ open, setOpen }) {
    //Store data for whats being edited
    const [users, setUsers] = useState([])
    const [QRCode, setQRCode] = useState(null)
    const [loading, setLoading] = useState(true)

    const saveChanges = async () => {
        if (users.length === 0) return;
        console.log("Saving changes");
        //Add the selected users to the backend and fill them in the parent
        const payload = {
            usernames: users.map((user) => user.username)
        };

        try {
           const genResponse = await api.get(`/accounts/generate_mfa_qr/`)
           const genData = genResponse.data
        } catch (error) {
           console.log("Error retrieving 2FA code:", error)
        }
    }



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Enable 2FA</DialogTitle>
                    <DialogDescription>
                        Use the authenticator app of your choice to scan this QR code.
                    </DialogDescription>
                </DialogHeader>

                {/* Form Content */}
                <img/>

                <DialogFooter>
                    
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default Enable2FA;