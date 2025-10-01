//This api provides an interceptor to the backend that all "apis" should use 
import axios from "axios";

import {ACCESS_TOKEN} from "./LocalStorage"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL_FOR_TEST//Link appended before all requests
})

//Set up interceptor
api.interceptors.request.use(
    //This function is run during the request. Config if just the object going outs configuraiton like headers
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        //If we have a token then attach token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config//Return modified request. Can either have or not have the token
    },
    //Run if there was an error
    (error) => {
        return Promise.reject(error)//Make error availible to catch of whatever called this interceptor
    }
)

export default api