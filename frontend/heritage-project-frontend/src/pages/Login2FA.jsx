import { useState } from "react";
import { login } from "../services/auth";
import { useErrorStore } from "../stores/ErrorStore";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import BadgeAward from "@/components/RoomsPage/BadgeAward";
//Define AuthLogin component
const AuthLogin = () => {
    const showError = useErrorStore((state) => state.showError);
    const navigate = useNavigate();
    const [code, setCode] = useState("")
    const [error, setError] = useState("")

    async function handleLogin() {
        if (username && password) {
            try {
                const data = await login(username, password); //Wait for external login function reply
                //check for 2fa
                if (data.mfa_required) {
                    //Need to get 2fa page

                    return
                }
                showError("Login success", "success");
                Debug.log("Login success:", data);

                navigate("/home");
            } catch (error) {
                //If somthing in try failed, default to here
                setError("Server error. Please try again.")
                console.error("2FA login error", error); //log error
            }
        } else {
            showError("Enter Username and Password", "warning");
        }
    }

    // Function to handle sign out
    const handleSignOut = async () => {
        try {
            // TODO: send sign-out request to backend
            console.log("Signing out:", username);
            showError("Logout success", "success");
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    };

    return (
        <div className="flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign in</CardTitle>
                    <CardDescription>
                        2FA Enabled — please enter your 2FA code
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
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

                        <div className="flex items-center justify-between gap-2">
                            <Button onClick={handleLogin}>Sign In</Button>
                            <Link to={`/signup`}>
                                <Button variant="outline">Sign Up</Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthLogin;
