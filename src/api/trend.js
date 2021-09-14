import request from './request'

export function getTrendData() {
  return request({
    url: '/trend'
  })
}