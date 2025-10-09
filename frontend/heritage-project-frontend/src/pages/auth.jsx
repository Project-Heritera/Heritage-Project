import { useState } from "react";
import { login } from "../services/auth";

const AuthLogin = () => {
  const [username, setUsernmae] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle sign in
  async function handleLogin() {
    if (username && password){
      const loginData = { 
        username,
        password
      };
      try {
        const data = await login(loginData);
        console.log("Login success:", data);
      } catch (error) {
        console.error(error);
      }
    }
    else{
      console.warn("enter username and password");
    }
  };

  // Function to handle sign out
  const handleSignOut = async () => {
    try {
      // TODO: send sign-out request to backend
      console.log("Signing out:", username);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <input
        type="username"
        placeholder="enter username"
        value={username}
        onChange={(e) => setUsernmae(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Sign In</button>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default AuthLogin;
