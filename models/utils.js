import fs from 'fs'
import { Version, Data, Config } from '../components/index.js'
import Request from './request.js'

const Utils = {
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

    logger.debug(`[清语表情] 开始转换 Buffer 为 Base64`)
    try {
      const base64Data = buffer.toString('base64')
      logger.debug(`[清语表情] Base64 转换完成`)
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
    const cacheDir = `${Version.Plugin_Path}/data/avatar`
    Data.createDir('data/avatar', '', false)

    const downloadAvatar = async (qq) => {
      const cachePath = `${cacheDir}/avatar_${qq}.jpg`

      if (Config.meme.cache && fs.existsSync(cachePath)) {
        logger.debug(`[清语表情] 使用已缓存头像: QQ=${qq}, Path=${cachePath}`)
        try {
          const buffer = fs.readFileSync(cachePath)
          logger.debug(`[清语表情] 已读取缓存头像 Buffer: QQ=${qq}`)
          return buffer
        } catch (error) {
          logger.error(`[清语表情] 读取缓存头像失败: QQ: ${qq}, 错误: ${error.message}`)
          throw error
        }
      }

      logger.debug(`[清语表情] 开始下载头像: QQ: ${qq}, URL: ${avatarUrl(qq)}`)
      try {
        const buffer = await Request.get(avatarUrl(qq), {}, 'arraybuffer')
        if (buffer && Buffer.isBuffer(buffer)) {
          fs.writeFileSync(cachePath, buffer)
          logger.debug(`[清语表情] 头像下载完成: QQ: ${qq}, Path: ${cachePath}`)
          return buffer
        } else {
          throw new Error('头像下载返回了无效的数据')
        }
      } catch (error) {
        logger.error(`[清语表情] 下载头像失败: QQ: ${qq}, 错误: ${error.message}`)
        throw error
      }
    }

    const results = await Promise.all(qqList.map((qq) => downloadAvatar(qq)))
    return qqList.length === 1 ? results[0] : results
  },

  /**
   * 获取图片
   **/
  async getImage (e, userText) {
    const imagesInMessage = e.message.filter((m) => m.type === "image").map((img) => img.url)
    const ats = e.message.filter((m) => m.type === "at").map((at) => at.qq)
    const manualAtQQs = [...userText.matchAll(/@(\d{5,11})/g)].map((match) => match[1])
    const quotedImages = e.source.message.filter((msg) => msg.type === "image").map((img) => img.url)

    const tasks = []

    const fetchBuffer = async (url, type) => {
      try {
        if (type === "image") {
          return await this.getImageBuffer(url)
        } else if (type === "avatar") {
          return await this.getAvatar(url)
        }
      } catch (err) {
        const errorType = type === "image" ? "图片" : "头像"
        logger.warn(`[清语表情] ${errorType}下载失败: ${url}, 错误: ${err.message}`)
        return null
      }
    }

    // 获取引用消息中的图片
    tasks.push(...quotedImages.map((imageUrl) => fetchBuffer(imageUrl, "image")))

    // 获取消息中的图片
    tasks.push(...imagesInMessage.map((url) => fetchBuffer(url, "image")))

    // 获取艾特用户的头像（长按头像艾特）
    tasks.push(...ats.map((qq) => fetchBuffer(qq, "avatar")))

    // 获取手动艾特用户的头像（@+QQ号）
    tasks.push(...manualAtQQs.map((qq) => fetchBuffer(qq, "avatar")))

    const results = await Promise.all(tasks)
    return results.filter(Boolean)
  },

  /**
   * 删除临时文件
   */
  deleteAvatar (filePaths) {
    if (!Array.isArray(filePaths)) filePaths = [filePaths]

    filePaths.forEach((filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          logger.debug(`[清语表情] 已删除临时头像文件: ${filePath}`)
        }
      } catch (error) {
        logger.error(`[清语表情] 删除头像文件失败, 错误: ${error.message}`)
      }
    })
  }
}

export default Utils
