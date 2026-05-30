import axios from 'axios'

// Общий interceptor — добавляет Bearer token из localStorage
const addAuthHeader = (config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}

// User Service
export const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // оставляем для cookie logout
})
userApi.interceptors.request.use(addAuthHeader)

// Product Service
export const productApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:8082',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})
productApi.interceptors.request.use(addAuthHeader)

// Order Service
export const orderApi = axios.create({
  baseURL: import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:8083',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})
orderApi.interceptors.request.use(addAuthHeader)

export default userApi
