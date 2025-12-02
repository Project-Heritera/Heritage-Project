import { useNavigate } from "react-router-dom"

// 1. Rename to start with 'use'
export const useLogout = () => {
    // 2. Now you can use hooks inside here!
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        window.location.href = "/login";
    }

    // 3. Return the function so the component can call it
    return logout;
}