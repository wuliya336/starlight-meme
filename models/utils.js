// Utils.js
import fs from 'fs'
import { Version, Data, Config } from '../components/index.js'
import Request from './request.js'
import Meme from './meme.js'

const Utils = {
  /**
   * 获取远程表情包数据
   */
  async downloadMemeData (forceUpdate = false) {
    try {
      const filePath = `${Version.Plugin_Path}/data/meme.json`
      Data.createDir('data')
      if (fs.existsSync(filePath) && !forceUpdate) {
        logger.debug('远程表情包数据已存在，跳过下载')
        return
      }
      if (forceUpdate && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      const response = await Request.get('https://pan.wuliya.cn/d/Yunzai-Bot/data/meme.json')
      Data.writeJSON('data/meme.json', response)
      logger.debug('远程表情包数据下载完成')
    } catch (error) {
      logger.error(`下载远程表情包数据失败: ${error.message}`)
      throw error
    }
  },

  async generateMemeData (forceUpdate = false) {
    try {
      const filePath = `${Version.Plugin_Path}/data/custom/meme.json`
      Data.createDir('data/custom', '', false)
      if (fs.existsSync(filePath) && !forceUpdate) {
        logger.debug('本地表情包数据已存在，跳过生成')
        return
      }
      if (forceUpdate && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      const baseUrl = await Meme.getBaseUrl()
      if (!baseUrl) {
        throw new Error('无法获取基础URL')
      }
      const keysResponse = await Request.get(`${baseUrl}/memes/keys`)
      const memeData = {}

      for (const key of keysResponse) {
        const infoResponse = await Request.get(`${baseUrl}/memes/${key}/info`)
        memeData[key] = infoResponse
      }

      Data.writeJSON('data/custom/meme.json', memeData, 2)
      logger.debug('本地表情包数据生成完成')
    } catch (error) {
      logger.error(`生成本地表情包数据失败: ${error.message}`)
      throw error
    }
  },
  /**
   * 获取图片 Buffer
   */
  async getImageBuffer (imageUrl) {
    if (!imageUrl) throw new Error('图片地址不能为空')

    logger.debug(`[清语表情] 开始下载图片: ${imageUrl}`)

    try {
      const buffer = await Request.get(imageUrl, {}, 'arraybuffer')
      logger.debug(`[清语表情] 图片下载完成: ${imageUrl}`)
      return buffer
    } catch (error) {
      logger.error(`[清语表情] 图片下载失败: ${error.message}`)
      throw error
    }
  },

  /**
   * 将图片 Buffer 转换为 Base64
   */
  async bufferToBase64 (buffer) {
    if (!buffer) throw new Error('图片 Buffer 不能为空')

    logger.debug('[清语表情] 开始转换 Buffer 为 Base64')
    try {
      const base64Data = buffer.toString('base64')
      logger.debug('[清语表情] Base64 转换完成')
      return base64Data
    } catch (error) {
      logger.error(`[清语表情] Base64 转换失败: ${error.message}`)
      throw error
    }
  },

  /**
   * 获取用户 QQ 头像
   */
  async getAvatar (qqList) {
    if (!qqList) throw new Error('QQ 号不能为空')
    if (!Array.isArray(qqList)) qqList = [qqList]

    const avatarUrl = (qq) => `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=640`

    if (!Config.meme.cache) {
      return
    }

    const cacheDir = `${Version.Plugin_Path}/data/avatar`
    if (!fs.existsSync(cacheDir)) {
      Data.createDir('data/avatar', '', false)
      logger.debug(`[清语表情] 创建头像缓存目录: ${cacheDir}`)
    }

    const downloadAvatar = async (qq) => {
      const cachePath = `${cacheDir}/avatar_${qq}.jpg`
      const remoteAvatarUrl = avatarUrl(qq)

      if (fs.existsSync(cachePath)) {
        try {
          const localStats = fs.statSync(cachePath)
          const remoteHeaders = await Request.head(remoteAvatarUrl)
          const remoteLastModified = new Date(remoteHeaders['last-modified'])
          const localLastModified = localStats.mtime

          if (localLastModified >= remoteLastModified) {
            logger.debug(`[清语表情] 使用已缓存头像: QQ=${qq}, Path=${cachePath}`)
            return fs.readFileSync(cachePath)
          }
        } catch (error) {
          logger.error(`[清语表情] 检查远程头像文件信息失败: QQ=${qq}, 错误: ${error.message}`)
        }
      }

      logger.debug(`[清语表情] 开始下载头像: QQ=${qq}, URL: ${remoteAvatarUrl}`)
      try {
        const buffer = await Request.get(remoteAvatarUrl, {}, 'arraybuffer')
        if (buffer && Buffer.isBuffer(buffer)) {
          fs.writeFileSync(cachePath, buffer)
          return buffer
        } else {
          throw new Error('头像下载返回了无效的数据')
        }
      } catch (error) {
        logger.error(`[清语表情] 下载头像失败: QQ=${qq}, 错误: ${error.message}`)
        throw error
      }
    }


    const results = await Promise.all(qqList.map((qq) => downloadAvatar(qq)))
    return results
  },
  /**
   * 获取用户昵称
   */
  async getNickname (qq) {
    if (!qq) throw new Error('QQ 号不能为空')

    try {
      const userInfo = await Bot.pickUser(qq).getInfo()
      return userInfo.nickname
    } catch (error) {
      logger.error(`[清语表情] 获取用户昵称失败: QQ=${qq}, 错误: ${error.message}`)
      return '未知'
    }
  },

  /**
   * 获取图片
   **/
  async getImage (e, userText, max_images) {
    const imagesInMessage = e.message
      .filter((m) => m.type === 'image')
      .map((img) => img.url)
    const ats = e.message.filter((m) => m.type === 'at').map((at) => at.qq)
    const manualAtQQs = [...userText.matchAll(/@(\d{5,11})/g)].map(
      (match) => match[1]
    )

    const quotedImagesOrAvatar = await this.getQuotedImages(e)

    let images = []
    let tasks = []

    /**
     * 引用消息的图片
     */
    if (quotedImagesOrAvatar.length > 0) {
      quotedImagesOrAvatar.forEach((item) => {
        if (Buffer.isBuffer(item)) {
          images.push(item)
        } else {
          tasks.push(this.getImageBuffer(item))
        }
      })
    }

    /**
     * 消息中的图片
     */
    if (imagesInMessage.length > 0) {
      tasks.push(
        ...imagesInMessage.map((imageUrl) => this.getImageBuffer(imageUrl))
      )
    }

    /**
     * 艾特用户头像(长按艾特)
     */
    if (quotedImagesOrAvatar.length === 0 && ats.length > 0) {
      const avatarBuffers = await Promise.all(ats.map((qq) => this.getAvatar(qq)))
      avatarBuffers.forEach(avatarList => {
        if (Array.isArray(avatarList)) {
          avatarList.forEach(avatar => {
            if (avatar) images.push(avatar)
          })
        } else if(avatarList) {
          images.push(avatarList)
        }
      })
    }

    /**
     * 手动输入的艾特(@+数字)
     */
    if (manualAtQQs.length > 0) {
      const avatarBuffers = await Promise.all(manualAtQQs.map((qq) => this.getAvatar(qq)))
      avatarBuffers.forEach(avatarList => {
        if (Array.isArray(avatarList)) {
          avatarList.forEach(avatar => {
            if (avatar) images.push(avatar)
          })
        } else if(avatarList) {
          images.push(avatarList)
        }
      })
    }

    const results = await Promise.allSettled(tasks)
    results.forEach((res) => {
      if (res.status === 'fulfilled' && res.value) {
        images.push(res.value)
      }
    })

    return images.slice(0, max_images)
  },


  /**
   * 获取引用消息
   */
  async getQuotedImages (e) {
    let source = null
    if (e.getReply) {
      source = await e.getReply()
    } else if (e.source) {
      if (e.group?.getChatHistory) {
        source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
      } else if (e.friend?.getChatHistory) {
        source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
      }
    }

    if (!source || !source.message || !Array.isArray(source.message))
      return []

    const imgArr = source.message
      .filter((msg) => msg.type === 'image')
      .map((img) => img.url)

    if (imgArr.length > 0 && source.message.length > imgArr.length) {
      try {
        const avatarBuffer = await this.getAvatar([source.sender.user_id])
        return avatarBuffer
      } catch (error) {
        return []
      }
    }
    else if (imgArr.length > 0 && source.message.every(msg => msg.type === 'image')) {
      return imgArr
    }
    else if (source.sender?.user_id) {
      try {
        const avatarBuffer = await this.getAvatar([source.sender.user_id])
        return avatarBuffer
      } catch (error) {
        return []
      }
    }

    return []
  }


}

export default Utils
