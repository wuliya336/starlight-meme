import { Data, Config } from '../components/index.js'
import Request from './request.js'

const Meme = {
  infoMap: null,
  loaded: false,

  get BASE_URL () {
    return (Config.meme.url || 'https://meme.wuliya.cn').replace(/\/+$/, '')
  },

  load () {
    if (this.loaded) {
      logger.debug('表情数据已加载，跳过重复加载')
      return
    }
    const infoMap = Data.readJSON('resources/meme/meme.json')
    if (!infoMap || typeof infoMap !== 'object') {
      logger.error('加载表情包详情失败')
      return
    }
    this.infoMap = infoMap
    this.loaded = true
  },

  getKey (keyword) {
    if (!this.loaded) {
      this.load()
    }
    for (const [key, value] of Object.entries(this.infoMap)) {
      if (value.keywords.includes(keyword)) {
        return key
      }
    }
    return null
  },

  getInfo (memeKey) {
    if (!this.loaded) {
      this.load()
    }
    return this.infoMap?.[memeKey] || null
  },

  async request (endpoint, params = {}, method = 'GET', responseType) {
    try {
      const url = `${this.BASE_URL}/${endpoint}`
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

  getPreviewUrl (memeKey) {
    if (!memeKey) {
      logger.error('表情键值不能为空')
      return null
    }
    const previewUrl = `${this.BASE_URL}/memes/${memeKey}/preview`
    return previewUrl
  }
}

export default Meme
