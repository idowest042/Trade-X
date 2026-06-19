import axios from 'axios';
export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' :'https://trade-x-4lcn.onrender.com/api',
    withCredentials: true,
})