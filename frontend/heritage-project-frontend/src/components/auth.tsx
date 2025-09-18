import { useState } from 'react';

export const authLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    try {
        //todo: add to db using email and password vars
    } catch (error) {
        console.error(error)
    }
  };

  const handleSignOut = async () => {
    try {
        //todo: interact with backend using email and password vars
    } catch (error) {
        console.error(error)
    }
  };

  return (
    <div>
      <input
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password..."
        type='password'
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signIn}> Sign In</button>
    <button onClick={handleSignOut}> Sign out</button>
    </div>
  );
};

export default authLogin
