import axios from 'axios'

const config = {
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
}

// User Service — аутентификация, профиль
export const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081',
  ...config,
})

// Product Service — галерея, загрузка работ
export const productApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:8082',
  ...config,
})

// Order Service — корзина, заказы, вишлист
export const orderApi = axios.create({
  baseURL: import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:8083',
  ...config,
})

// Дефолтный экспорт для обратной совместимости (старые файлы которые ещё не обновлены)
export default userApi
