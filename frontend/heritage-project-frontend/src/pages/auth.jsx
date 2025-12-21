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
import api from "@/services/api";
//Define AuthLogin component
const AuthLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authData, setAuthData] = useState(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const showError = useErrorStore((state) => state.showError);
  const navigate = useNavigate();

  async function handleLogin() {
    if (username && password) {
      try {
        const data = await login(username, password); //Wait for external login function reply
        //check for 2fa
        if (data.mfa_required) {
          //Need to get 2fa page
          setAuthData(data)
          return
        }
        Debug.log("Login success:", data);
        setUsername("");
        setPassword("");

        navigate("/home");
      } catch (error) {
        //If somthing in try failed, default to here
        if (error.status == 404) {
          showError(
            "Invalid login. Incorrect password provided or account doesn't exist.",
            "error"
          );
        } else {
          showError(
            "Something went wrong when logging in. Please try again later",
            "error"
          );
        }
        console.error(error); //log error
      }
    } else {
      showError("Enter Username and Password", "warning");
    }
  }

  const handle2FA = async () => {
    if (code.length < 6) {
      console.log("Setting too small error")
      setError("Invalid code. Code must be a 6 digit number.")
      return
    }
    console.log("Sending 2nd login 2fa:", authData)
    console.log("Code sent was:", code)
    try {
      const response = await api.post(`/accounts/login_step2/`, {
        ephemeral_token: authData.ephemeral_token,
        otp: code
      })
      console.log("Response from 2ndlogin is:", response)
      //set token and navigate home
      if (response.data.mfa_success) {
        //Navigate home
        console.log("Wraping up login")
        login(username, password, response)
        navigate(`/home`)
      } else {
        setError("Invalid code. Please try again.")
      }

    } catch (error) {
      setError("Server error. Please try again.")
      console.error("2FA login error:", error)
    }
  }

  // Function to handle sign out
  const handleSignOut = async () => {
    try {
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
          {!authData && (
            <div>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Welcome back — please sign in to your account
              </CardDescription>
            </div>
          )}

          {authData && (
            <div>
              <CardTitle>2FA</CardTitle>
              <CardDescription>
                2FA Enabled — please enter your authentication code
              </CardDescription>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!authData && (
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
              <div></div>

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
                <Link to={`/signup`}>
                  <Button variant="outline">Sign Up</Button>
                </Link>
              </div>
            </div>
          )}

          {/* 2FA view */}
          {authData && (
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
                <Button onClick={authData ? handle2FA : handleLogin}>Sign In</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLogin;
