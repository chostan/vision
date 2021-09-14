import axios from 'axios'

function request(config) {
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8888/api/'
  })

  instance.interceptors.response.use(res => {
    return res.data
  }, err => {
    return Promise.reject(err)
  })

  return instance(config)
}

export default request