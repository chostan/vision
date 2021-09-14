import request from './request'

export function getHotData() {
  return request({
    url: '/hotproduct'
  })
}