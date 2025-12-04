import { useState } from "react";
import { login } from "../services/auth";
import { useErrorStore } from "../stores/ErrorStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
//Define AuthLogin component
const AuthLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const showError = useErrorStore((state) => state.showError);
  const navigate = useNavigate();

  // Function to handle sign in
  async function handleLogin() {
    //Check if username and password are not empty
    if (username && password){
      try {
        const data = await login(username, password);//Wait for external login function reply
        showError("Login success", "success");
        Debug.log("Login success:", data);
        setUsername("");
        setPassword("");
        
        navigate('/home/'+username);
      } catch (error) {
        //If somthing in try failed, default to here
        if (error.status == 404){
          showError("Invalid Log in. Incorrect password provided or account dosen't exist", "error");
        }
        else {
          showError("Something went wrong when logging in. Please try again later", "error");
        }
        console.error(error);//log error
      }
    }
    else{
      showError("Enter Username and Password", "warning");
    }
  };

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
          <CardDescription>Welcome back — please sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
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
            <div>
           </div>

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

            <div className="flex items-center justify-between gap-2">
              <Button onClick={handleLogin}>Sign In</Button>
            </div>
         </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLogin;
