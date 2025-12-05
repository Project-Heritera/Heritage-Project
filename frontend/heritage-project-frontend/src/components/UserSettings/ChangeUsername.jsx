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

function ChangeEmail({ }) {
    //Store data for whats being edited
    const [users, setUsers] = useState([])
    const [QRCode, setQRCode] = useState("")
    const [loading, setLoading] = useState(true)
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [open, setOpen] = useState(false)
    const [verified, setVerified] = useState(true)
    const [email, setEmail] = useState("")
    const [is2FAEnabled, setIs2FAEnabled] = useState(false)

    useEffect(() => {
        setLoading(true)
        const getCode = async () => {
            try {
                const isEnabledResponse = await api.get(`/accounts/check_mfa_enabled/`)
                setIs2FAEnabled(isEnabledResponse.data.mfa_enabled)
                setLoading(false)
            } catch (error) {
                console.log("Error retirving data for apssword change:", error)
                setLoading(false)
            }
        }

        getCode()
    }, [])

    const makeChange = async () => {
        if (code.length < 6) {
            setError("Invalid code. Code must be a 6 digit number.")
            return
        }

        if (email.length === 0) {
            setError("email may not be empty.")
            return
        }

        try {
            const response = await api.post(`/accounts/update_vital_user_info/`,
                {
                    code: code,
                    email: email
                })
            const data = response.data
            console.log("Email Change response was:", response)
            if (!data.success) {
                //error ask to redo
                setError("Invalid code. Please try again.")
            } else {
                console.log("SUCCESS validating 2FA!")
                setQRCode("");
                setCode("")
                setError("")
                setVerified(true)
            }
        } catch (error) {
            console.error("Error validating 2FA or email:", error)
            setError("Server error. Please try again.")
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger>
                <Button variant="outline">Change Email</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[380px]">
                <DialogHeader>
                    <DialogTitle>Change Email</DialogTitle>
                    {is2FAEnabled && (
                        <DialogDescription>
                            Enter your code to verify its you. Then choose a new email.
                        </DialogDescription>
                    )}

                    {!is2FAEnabled && (
                        <DialogDescription>
                            Choose a new email.
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/* Form Content */}

                <div className="grid gap-4 py-4">

                    <div className="grid w-full items-center gap-1.5">
                        {is2FAEnabled && (
                            <div>
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
                            </div>
                        )}

                        <Label htmlFor="2fa-code">New Email</Label>
                        <Input
                            id="2fa-code"
                            type="text"
                            placeholder="johndoe@gmail.com"
                            value={email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value)
                                if (error) setError("");
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
                                    setOpen(false);
                                }}
                                variant="outline">
                                Cancel
                            </Button>
                        </div>
                        <div>
                            <Button onClick={makeChange}>
                                Verify & Change Email
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ChangeEmail;