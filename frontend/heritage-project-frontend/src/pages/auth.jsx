import { useState } from "react";
import { login } from "../services/auth";
import { TaskComponentMenu } from "../components/TaskAndTaskComponents/TaskComponentMenu";
import PublicationForm from "../components/PublicationForm";
import { useErrorStore } from "../stores/ErrorStore";
import Modal from "../components/Modal";
//Define AuthLogin component
const AuthLogin = () => {
  const [username, setUsernmae] = useState("");
  const [password, setPassword] = useState("");
const showError = useErrorStore((state) => state.showError);
  const [isModalOpen, setModalOpen] = useState(false);
  const handleTemplateSelect = (templateKey) => {
    console.log("Selected template:", templateKey);
    // do whatever you need with the selected template
  };
  const handleClose = () => setModalOpen(false);


  // Function to handle sign in
  async function handleLogin() {
    //Check if username and password are not empty
    if (username && password){
      try {
        const data = await login(username, password);//Wait for external login function reply
        showError("Login success", "success");
        Debug.log("Login success:", data);
        setUsernmae("");
        setPassword("");
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
      <button
        onClick={() => setModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Open Template Selector
      </button>g
<Modal isOpen={isModalOpen} onClose={handleClose} animationType="slide">
<TaskComponentMenu onSelect={handleTemplateSelect} onClose={handleClose}/>       
      </Modal>
     
    </div>
    </div>
  );
};

export default AuthLogin;
