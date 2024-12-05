import { logger } from '../components/Base/index.js'
import Request from './request.js'

const BASE_URL = 'https://meme.wuliya.cn'

const Meme = {
  keyMap: null,
  infoMap: null,

  /**
   * 加载全部数据
   */
  load () {
    this.loadKeyMap()
    this.loadInfoMap()
  },

  getKey (keyword) {
    return this.keyMap?.[keyword] || null
  },

  getInfo (memeKey) {
    return this.infoMap?.[memeKey] || null
  },

  async request (endpoint, params = {}, method = 'GET', responseType) {
    try {
      const url = `${BASE_URL}/${endpoint}`
      if (method.toUpperCase() === 'GET') {
        return await Request.get(url, params, responseType)
      } else if (method.toUpperCase() === 'POST') {
        return await Request.post(url, params, responseType)
      } else {
        throw new Error('不支持的请求方法')
      }
    } catch (error) {
      logger.error(`请求 ${endpoint} 失败: ${error.message}`)
      throw error
    }
  }
}

export default Meme
