import { useState } from "react";
import { login } from "../services/auth";
import PublicationForm from "../components/PublicationForm";
//Define AuthLogin component
const AuthLogin = () => {
  const [username, setUsernmae] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle sign in
  async function handleLogin() {
    //Check if username and password are not empty
    if (username && password){
      try {
        const data = await login(username, password);//Wait for external login function reply
        console.log("Login success:", data);
      } catch (error) {
        //If somthing in try failed, default to here
        console.error(error);//log error
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
<div>
      <PublicationForm FormType={"Room"} room_id={1} section_id={1} course_id={1}/>
    </div>
    </div>
  );
};

export default AuthLogin;
