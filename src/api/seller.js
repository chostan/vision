import request from './request'

export function getSellerData() {
  return request({
    url: 'seller'
  })
}