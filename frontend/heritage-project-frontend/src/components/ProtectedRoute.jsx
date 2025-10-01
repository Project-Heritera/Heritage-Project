import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import { ACCESS_TOKEN } from '../services/LocalStorage';

const ProtectedRoute = () => {
    const token = localStorage.getItem(ACCESS_TOKEN)

    //Check if they have logged in yet
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    //Token exists
    return <Outlet />;
};

export default ProtectedRoute;