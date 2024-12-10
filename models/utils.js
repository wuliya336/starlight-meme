import fs from "fs"
import { Version, Data, Config } from "../components/index.js"
import Request from "./request.js"

const Utils = {
  /**
   * 获取图片 Buffer
   */
  async getImageBuffer (imageUrl) {
    if (!imageUrl) throw new Error("图片地址不能为空")

    logger.debug(`[清语表情] 开始下载图片: ${imageUrl}`)

    try {
      const buffer = await Request.get(imageUrl, {}, "arraybuffer")
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
    if (!buffer) throw new Error("图片 Buffer 不能为空")

    logger.debug(`[清语表情] 开始转换 Buffer 为 Base64`)
    try {
      const base64Data = buffer.toString("base64")
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
    if (!qqList) throw new Error("QQ 号不能为空")
    if (!Array.isArray(qqList)) qqList = [qqList]

    const avatarUrl = (qq) => `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=640`
    const cacheDir = `${Version.Plugin_Path}/data/avatar`

    if (!Config.meme.cache) {
      if (fs.existsSync(cacheDir)) {
        try {
          fs.rmSync(cacheDir, { recursive: true, force: true })
          logger.debug(`[清语表情] 缓存关闭，已删除头像缓存目录: ${cacheDir}`)
        } catch (error) {
          logger.error(`[清语表情] 删除头像缓存目录失败: ${error.message}`)
        }
      }
      return
    }

    if (!fs.existsSync(cacheDir)) {
      Data.createDir("data/avatar", "", false)
      logger.debug(`[清语表情] 创建头像缓存目录: ${cacheDir}`)
    }

    const downloadAvatar = async (qq) => {
      const cachePath = `${cacheDir}/avatar_${qq}.jpg`

      if (fs.existsSync(cachePath)) {
        logger.debug(`[清语表情] 使用已缓存头像: QQ=${qq}, Path=${cachePath}`)
        try {
          const buffer = fs.readFileSync(cachePath)
          return buffer
        } catch (error) {
          logger.error(
            `[清语表情] 读取缓存头像失败: QQ=${qq}, 错误: ${error.message}`
          )
          throw error
        }
      }

      logger.debug(`[清语表情] 开始下载头像: QQ=${qq}, URL: ${avatarUrl(qq)}`)
      try {
        const buffer = await Request.get(avatarUrl(qq), {}, "arraybuffer")
        if (buffer && Buffer.isBuffer(buffer)) {
          fs.writeFileSync(cachePath, buffer)
          return buffer
        } else {
          throw new Error("头像下载返回了无效的数据")
        }
      } catch (error) {
        logger.error(
          `[清语表情] 下载头像失败: QQ=${qq}, 错误: ${error.message}`
        )
        throw error
      }
    }

    const results = await Promise.all(qqList.map((qq) => downloadAvatar(qq)))
    return qqList.length === 1 ? results[0] : results
  },

  /**
   * 获取图片
   **/
  async getImage (e, userText, max_images, min_images) {
    const imagesInMessage = e.message
      .filter((m) => m.type === "image")
      .map((img) => img.url)
    const ats = e.message.filter((m) => m.type === "at").map((at) => at.qq)
    const manualAtQQs = [...userText.matchAll(/@(\d{5,11})/g)].map(
      (match) => match[1]
    )

    const quotedImagesOrBuffers = await this.getQuotedImages(e)

    let images = []
    let tasks = []

    /**
     * 引用消息的图片
     */
    if (quotedImagesOrBuffers.length > 0) {
      quotedImagesOrBuffers.forEach((item) => {
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
    if (quotedImagesOrBuffers.length === 0 && ats.length > 0) {
      tasks.push(...ats.map((qq) => this.getAvatar(qq)))
    }

    /**
     * 手动输入的艾特(@+数字)
     */
    if (manualAtQQs.length > 0) {
      tasks.push(...manualAtQQs.map((qq) => this.getAvatar(qq)))
    }

    const results = await Promise.allSettled(tasks)
    results.forEach((res) => {
      if (res.status === "fulfilled" && res.value) {
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

    if (!source || !source.message || !Array.isArray(source.message)) return []

    const imgArr = []
    let isOnlyImage = true

    for (const msg of source.message) {
      if (msg.type === "image") {
        imgArr.push(msg.url)
      } else {
        isOnlyImage = false
      }
    }

    if (!isOnlyImage && source.sender?.user_id) {
      try {
        const avatarBuffer = await this.getAvatar(source.sender.user_id)
        return [avatarBuffer]
      } catch (error) {
        return []
      }
    }

    return imgArr
  },

  /**
   * 删除临时文件
   */
  deleteAvatarDirectory () {
    const cacheDir = `${Version.Plugin_Path}/data/avatar`

    if (fs.existsSync(cacheDir)) {
      try {
        fs.rmSync(cacheDir, { recursive: true, force: true })
        logger.debug(`[清语表情] 已删除头像缓存目录: ${cacheDir}`)
      } catch (error) {
        logger.error(`[清语表情] 删除头像缓存目录失败: ${error.message}`)
      }
    } else {
      logger.warn(`[清语表情] 头像缓存目录不存在: ${cacheDir}`)
    }
  }
}

export default Utils
