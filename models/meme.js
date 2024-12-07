import { Data, Config } from '../components/index.js'
import Request from './request.js'

let BASE_URL = 'https://meme.wuliya.cn'

if (BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL.slice(0, -1)
}

const Meme = {
  keyMap: null,
  infoMap: null,
  loaded: false,

  /**
   * 初始化加载全
   */
  load () {
    if (this.loaded) {
      logger.debug('表情数据已加载，跳过重复加载')
      return
    }
    this.loadKeyMap()
    this.loadInfoMap()
    this.loaded = true
    logger.debug('表情数据加载完成')
  },

  /**
   * 加载表情正则规则
   */
  loadKeyMap () {
    if (!this.keyMap) {
      logger.debug('加载表情规则映射...')
      const keyMap = Data.readJSON('resources/meme/keyMap.json')
      if (!keyMap || typeof keyMap !== 'object') {
        logger.error('加载表情规则失败')
        return
      }
      this.keyMap = keyMap
      logger.debug('表情规则映射加载完成')
    }
  },

  /**
   * 加载表情包详情
   */
  loadInfoMap () {
    if (!this.infoMap) {
      logger.debug('加载表情包详情...')
      const infoMap = Data.readJSON('resources/meme/info.json')
      if (!infoMap || typeof infoMap !== 'object') {
        logger.error('加载表情包详情失败')
        return
      }
      this.infoMap = infoMap
      logger.debug('表情包详情数据加载完成')
    }
  },

  /**
   * 根据关键字获取表情
   */
  getKey (keyword) {
    if (!this.keyMap) {
      this.loadKeyMap()
    }
    return this.keyMap?.[keyword] || null
  },

  /**
   * 根据表情键值获取表情详情
   */
  getInfo (memeKey) {
    if (!this.infoMap) {
      this.loadInfoMap()
    }
    return this.infoMap?.[memeKey] || null
  },

  /**
   * 表情请求接口
   */
  async request (endpoint, params = {}, method = 'GET', responseType) {
    try {
      const url = `${BASE_URL}/${endpoint}`
      if (method.toUpperCase() === 'GET') {
        return await Request.get(url, params)
      } else if (method.toUpperCase() === 'POST') {
        return await Request.post(url, params, responseType)
      } else {
        throw new Error('不支持的请求方法')
      }
    } catch (error) {
      logger.error(`请求 ${endpoint} 失败: ${error.message}`)
      throw error
    }
  },
  /**
   * 获取预览图 URL
   */
  getPreviewUrl (memeKey) {
    if (!memeKey) {
      logger.error('表情键值不能为空')
      return null
    }
    const previewUrl = `${BASE_URL}/memes/${memeKey}/preview`
    return previewUrl
  }
}

export default Meme
