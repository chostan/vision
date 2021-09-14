import request from './request'

export function getStockData() {
  return request({
    url: '/stock'
  })
}