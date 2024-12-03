import { logger, segment } from '../components/Base/index.js'
import { Data, Config } from '../components/index.js'
import Request from './request.js'
import Utils from './utils.js'
import FormData from 'form-data'

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

  /**
   * 请求表情包数据
   */
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
  },
  /**
   * 文本类型表情处理
   */
  async text (e, memeKey, matchedKeyword, message) {
    const userText = message.slice(matchedKeyword.length).trim()

    try {
      logger.debug(`[星点表情] 发送文本类型表情请求: ${memeKey}`)
      const endpoint = `memes/${memeKey}/`
      const result = await this.request(endpoint, userText ? { texts: userText } : null, 'POST', 'arraybuffer')

      if (Buffer.isBuffer(result)) {
        const base64Image = await Utils.bufferToBase64(result)
        if (Config.meme.reply) {
          e.reply(segment.image(`base64://${base64Image}`), true) 
          e.reply(segment.image(`base64://${base64Image}`))
        }
      } else {
        if (Config.meme.reply) {
          e.reply(segment.image(result), true) 
          e.reply(segment.image(result))
        }
      }
      return false
    } catch (error) {
      logger.error(`[星点表情] 文本类型表情请求失败: ${error.message}`)
      e.reply(`生成表情包失败: ${error.message}`)
      return false
    }
  },

  /**
   * 图片类型表情处理
   */
  async image (e, memeKey, memeInfo) {
    const { min_images, max_images } = memeInfo.params_type || {}
    let formData = new FormData()

    try {
      const imagesInMessage = e.message.filter((m) => m.type === 'image').map((img) => img.url)
      const ats = e.message.filter((m) => m.type === 'at').map((at) => at.qq)
      const manualAtQQs = [...e.msg.matchAll(/@(\d{5,11})/g)].map((match) => match[1])

      const tasks = []

      tasks.push(
        ...imagesInMessage.map(async (url) => {
          try {
            const buffer = await Utils.getImageBuffer(url)
            if (buffer) {
              logger.debug(`[星点表情] 消息图片已下载: ${url}`)
              return buffer
            }
          } catch (err) {
            logger.warn(`[星点表情] 消息图片下载失败: ${url}, 错误: ${err.message}`)
          }
          return null
        })
      )

      tasks.push(
        ...ats.map(async (qq) => {
          try {
            const avatar = await Utils.getAvatar(qq)
            if (avatar) {
              logger.debug(`[星点表情] 艾特用户头像已获取: QQ: ${qq}`)
              return avatar
            }
          } catch (err) {
            logger.warn(`[星点表情] 无法获取艾特用户头像: QQ: ${qq}, 错误: ${err.message}`)
          }
          return null
        })
      )

      tasks.push(
        ...manualAtQQs.map(async (qq) => {
          try {
            const avatar = await Utils.getAvatar(qq)
            if (avatar) {
              logger.debug(`[星点表情] 手动艾特用户头像已获取: QQ: ${qq}`)
              return avatar
            }
          } catch (err) {
            logger.warn(`[星点表情] 无法获取手动输入艾特用户头像: QQ: ${qq}, 错误: ${err.message}`)
          }
          return null
        })
      )

      let images = (await Promise.all(tasks)).filter(Boolean)

      if (images.length < min_images) {
        const triggerAvatar = await Utils.getAvatar(e.user_id)
        while (images.length < min_images) {
          images.unshift(triggerAvatar)
        }
      }

      images = images.slice(0, max_images)
      images.forEach((buffer, index) => {
        formData.append('images', buffer, `image${index}.jpg`)
      })

      const endpoint = `memes/${memeKey}/`
      logger.debug(`[星点表情] 发送表情包请求: ${endpoint}`)
      const result = await this.request(endpoint, formData, 'POST', 'arraybuffer')

      if (Buffer.isBuffer(result)) {
        const base64Image = await Utils.bufferToBase64(result)
        if (Config.meme.reply) {
          await e.reply(segment.image(`base64://${base64Image}`), true) 
        } else {
          await e.reply(segment.image(`base64://${base64Image}`))
        }
      } else {
        if (Config.meme.reply) {
          await e.reply(segment.image(result), true) 
        } else {
          await e.reply(segment.image(result))
        }
      }
      return false
    } catch (error) {
      logger.error(`[星点表情] 图片处理失败: ${error.message}`)
      await e.reply(`表情包生成失败: ${error.message}`)
      return false
    }
  }
}

export default Meme
