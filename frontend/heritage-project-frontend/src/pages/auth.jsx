import { useState, useEffect } from "react";
import { login } from "../services/auth";
import { LogIn, LogOutIcon } from "lucide-react";
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
import { useLogout } from "@/services/logout";
//Define AuthLogin component
const AuthLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authData, setAuthData] = useState(null);
  const [code, setCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const showError = useErrorStore((state) => state.showError);
  const navigate = useNavigate();
  const performLogout = useLogout();


  //if enter is pressed on username and passwrod inputs, trigger login
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  async function handleLogin() {
    if (username && password) {
      try {
        const data = await login(username, password); //Wait for external login function reply
        //check for 2fa
        if (data.mfa_required) {
          //Need to get 2fa page
          setAuthData(data);
          return;
        }
        // If login is successful and no 2FA is required, set tokens
        console.log("Login success:", data);
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

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
      console.log("Setting too small error");
      setError("Invalid code. Code must be a 6 digit number.");
      return;
    }
    console.log("Sending 2nd login 2fa:", authData);
    console.log("Code sent was:", code);
    try {
      const response = await api.post(`/accounts/login_step2/`, {
        ephemeral_token: authData.ephemeral_token,
        otp: code,
      });
      console.log("Response from 2ndlogin is:", response);
      //set token and navigate home
      if (response.data.mfa_success) {
        //Navigate home
        console.log("Wraping up login");
        // Directly use the tokens from the successful 2FA response
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        navigate(`/home`); // Navigate after setting tokens
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (error) {
      setError("Server error. Please try again.");
      console.error("2FA login error:", error);
    }
  };

  useEffect(() => {
    // On component mount, check if an access token exists in localStorage
    const token = localStorage.getItem("access_token");
    console.log("Token is:", token);
    setIsLoggedIn(!!token); // Set isLoggedIn to true if token exists, false otherwise
  }, []);

  return (
    <div className="flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          {!authData && !isLoggedIn && (
            <div>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Welcome back &mdash; please sign in to your account
              </CardDescription>
            </div>
          )}

          {authData && (
            <div>
              <CardTitle>2FA</CardTitle>
              <CardDescription>
                2FA Enabled &mdash; please enter your authentication code
              </CardDescription>
            </div>
          )}

          {isLoggedIn && !authData && (
            <div>
              <CardTitle>You are already logged in</CardTitle>
              <CardDescription>Would you like to sign out?</CardDescription>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!authData && !isLoggedIn && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyPress}
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
                  onKeyDown={handleKeyPress}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Button onClick={handleLogin}>
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
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
                  className={`text-center tracking-widest text-lg ${
                    error ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                />
                {error && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button onClick={authData ? handle2FA : handleLogin}>
                  Sign In
                </Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </div>
          )}
          {/* Logged In View */}
          {isLoggedIn && !authData && (
            <div className="grid gap-4">
              <Button onClick={performLogout}>
                <LogOutIcon className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLogin;
