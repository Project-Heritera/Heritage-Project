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
import { AlertCircle } from "lucide-react"
import { tr } from "date-fns/locale";

function Disable2FA({ open, setOpen, setChecked }) {
    //Store data for whats being edited
    const [users, setUsers] = useState([])
    const [QRCode, setQRCode] = useState("")
    const [loading, setLoading] = useState(true)
    const [code, setCode] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        setLoading(true)
    }, [])

    const verifyCode = async () => {
        if (code.length < 6) {
            setError("Invalid code. Code must be a 6 digit number.")
            setChecked(true)
            return
        }
        try {
            const response = await api.post(`/accounts/login_step2/`,
                {
                    code: code
                })
            const data = response.data
            if (!data.success) {
                //error ask to redo
                setError("Invalid code. Please try again.")
                setChecked(true)
            } else {
                console.log("SUCCESS validating 2FA!")
                setQRCode("");
                setCode("")
                setError("")
                setChecked(false)
                setOpen(false);
            }
        } catch (error) {
            console.error("Error validating 2FA:", error)
            setError("Server error. Please try again.")
            setChecked(true)
        }
    }



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[380px]">
                <DialogHeader>
                    <DialogTitle>Disable 2FA</DialogTitle>
                    <DialogDescription>
                        Enter your code to disable 2fa - disabling 2fa will make your account vulnerable to brute force attacks.
                    </DialogDescription>
                </DialogHeader>

                {/* Form Content */}

                <div className="grid gap-4 py-4">

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="2fa-code">Authentication Code</Label>
                        <Input
                            id="2fa-code"
                            type="text"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value;

                                // 1. Regex checks if value contains ONLY digits or is empty
                                // 2. Checks if length is 6 or less
                                if (/^\d*$/.test(value) && value.length <= 6) {
                                    setCode(value);
                                    if (error) setError("");
                                }
                            }}
                            className={`text-center tracking-widest text-lg ${error ? "border-red-500 focus-visible:ring-red-500" : ""
                                }`}
                        />
                        {error && (
                            <div className="flex items-center text-red-500 text-sm mt-1">

                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex justify-between w-full">
                        <div>
                            <Button
                                onClick={() => {
                                    setQRCode("");
                                    setCode("")
                                    setError("")
                                    setChecked(true)
                                    setOpen(false);
                                }}
                                variant="outline">
                                Cancel
                            </Button>
                        </div>
                        <div>
                            <Button onClick={verifyCode}>
                                Verify & Disable
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default Disable2FA;