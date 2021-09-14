import axios from 'axios'
import request from './request'

export function getMapData() {
  const instance = axios.create()

  instance.interceptors.response.use(res => {
    return res.data
  }, err => {
    return Promise.reject(err)
  })

  return instance({
    url: 'http://localhost:8999/static/map/china.json'
  })
}

export function getMapScatter() {
  return request({
    url: '/map'
  })
}

export function getProvinceData(provincePath) {
  const instance = axios.create({
    baseURL: 'http://localhost:8999/'
  })

  instance.interceptors.response.use(res => {
    return res.data
  }, err => {
    return Promise.reject(err)
  })

  return instance({
    url: provincePath
  })
}