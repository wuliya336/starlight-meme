import { logger } from '../components/Base/index.js'
import Request from './request.js'

const BASE_URL = 'https://meme.wuliya.cn'

const Meme = {
  keyMap: null,
  infoMap: null,

  /**
   * 加载表情正则规则
   */
  loadKeyMap () {
    const keyMap = Data.readJSON('resources/meme/keyMap.json')
    if (!keyMap || typeof keyMap !== 'object') {
      logger.error('加载表情规则失败')
      return
    }
    this.keyMap = keyMap
    logger.debug('表情规则映射加载完成')
  },

  /**
     * 加载表情包详情
     */
  loadInfoMap () {
    const infoMap = Data.readJSON('resources/meme/info.json')
    if (!infoMap || typeof infoMap !== 'object') {
      logger.error('加载表情包详情失败')
      return
    }
    this.infoMap = infoMap
    logger.debug('表情包详情数据加载完成')
  },
  /**
   * 加载全部数据
   */
  load () {
    this.loadKeyMap()
    this.loadInfoMap()
  },

  /**
   * 获取表情包键值
   */
  getKey (keyword) {
    return this.keyMap?.[keyword] || null
  },

  /**
   * 获取表情包详情
   */
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
