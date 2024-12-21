import { Data, Config } from '../components/index.js'
import Utils from './utils.js'
import Request from './request.js'

const Meme = {
  infoMap: null,
  loaded: false,
  baseUrl: null,

  async getBaseUrl () {
    if (this.baseUrl) {
      return this.baseUrl
    }
    if (Config.meme.url) {
      this.baseUrl = Config.meme.url.replace(/\/+$/, '')
      return this.baseUrl
    }

    let Url = 'https://meme.wuliya.cn'
    const urls = [
      'https://blog.cloudflare.com/cdn-cgi/trace',
      'https://developers.cloudflare.com/cdn-cgi/trace'
    ]

    try {
      const response = await Promise.any(urls.map(url => Request.get(url, {}, 'text')))
      const traceMap = Object.fromEntries(
        response.split('\n').filter(line => line).map(line => line.split('='))
      )
      if (traceMap.loc != 'CN') {
        Url = 'https://meme.wuliya.xin'
      }
    } catch (error) {
      logger.error(`获取IP地址出错，使用默认 URL: ${error.message}`)
    }
    this.baseUrl = Url
    return this.baseUrl
  },

  async load () {
    if (this.loaded) {
      logger.debug('表情数据已加载，跳过重复加载')
      return
    }

    try {
      if (!Config.meme.url) {
        await Utils.downloadMemeData()
        this.infoMap = Data.readJSON('data/meme.json')
      } else {
        await Utils.generateMemeData()
        this.infoMap = Data.readJSON('data/custom/meme.json')
      }

      if (!this.infoMap || typeof this.infoMap !== 'object') {
        logger.error('加载表情包详情失败')
        return
      }
      this.loaded = true
    } catch (error) {
      logger.error(`加载表情包数据出错: ${error.message}`)
    }
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
      const baseUrl = await this.getBaseUrl()
      const url = `${baseUrl}/${endpoint}`
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

  async getPreviewUrl (memeKey) {
    if (!memeKey) {
      logger.error('表情键值不能为空')
      return null
    }
    const baseUrl = await this.getBaseUrl()
    const previewUrl = `${baseUrl}/memes/${memeKey}/preview`
    return previewUrl
  }
}

export default Meme
