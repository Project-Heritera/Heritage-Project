import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {ACCESS_TOKEN, REFRESH_TOKEN} from '../services/LocalStorage';

//ProtectedRoute is used lock down a route on the client side and redirect user to login page if not logged in
const ProtectedRoute = () => {
    const token = localStorage.getItem(ACCESS_TOKEN)
    console.log("Key being used for retrieval:", ACCESS_TOKEN);
    //Check if they have logged in yet
    if (!token) {
        console.log("User not logged in so redirect")
        return <Navigate to="/login" replace />;
    }

    //Token exists
    return <Outlet />;
};

export default ProtectedRoute;