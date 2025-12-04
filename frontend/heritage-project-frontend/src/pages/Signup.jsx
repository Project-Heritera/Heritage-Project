import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
    // 1. Define State Variables
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");       // <--- ADDED EMAIL STATE
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // 2. Handle the Signup Logic
    const handleSignup = async () => {
        console.log("Signing up with:", { username, email, password });

        if (!username || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const res = await api.post("/accounts/signup/", {
                username: username,
                email: email,
                password: password
            });
            navigate(`/login`)
        } catch (error) {
            console.error("Error on signup:", error)
            if (error.response && error.response.data) {
                alert(`Signup failed: ${JSON.stringify(error.response.data)}`);
            } else {
                alert("An error occurred during signup.");
            }
        }

    };

    return (
        <div className="flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Welcome — please create an account</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">

                        {/* USERNAME FIELD */}
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        {/* EMAIL FIELD (New) */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* PASSWORD FIELD */}
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* BUTTON */}
                        <div className="flex items-center justify-between gap-2 mt-2">
                            <Button className="w-full" onClick={handleSignup}>
                                Create Account
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}