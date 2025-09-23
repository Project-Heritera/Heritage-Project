import { useState } from "react";

const CourseView = () => {

  // Function to handle sign in
  async function loadUserCourses() {
    /*
    if (username && password){
      try {
        const data = await login(username, password);
        console.log("Login success:", data);
      } catch (error) {
        console.error(error);
      }
    }
    else{
      console.warn("enter username and password");
    }
      */
  };

  return (
    <>
    <div className="courses-view" >
        <div className="courses-view-header"></div>
        <div className="course-view-body">
            <div className="course-view-body-header">
                <div className="search-bar"></div>
            </div>
            <div className="course-view-body-body">
                <div className="course-container">
                    <div className="course-title"></div>
                    <div className="course-progress-bar"></div>
                </div>
            </div>
        </div>
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
        </>
  );
};

export default CourseView;
