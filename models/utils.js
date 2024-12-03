import fs from 'fs'
import { logger } from '../components/Base/index.js'
import { Version, Data, Config } from '../components/index.js'
import Request from './request.js'

const Utils = {
  /**
   * 获取图片 Buffer
   */
  async getImageBuffer (imageUrl) {
    if (!imageUrl) throw new Error('图片地址不能为空')

    logger.info(`[星点表情] 开始下载图片: ${imageUrl}`)

    try {
      const buffer = await Request.get(imageUrl, {}, 'arraybuffer')
      logger.info(`[星点表情] 图片下载完成: ${imageUrl}`)
      return buffer
    } catch (error) {
      logger.error(`[星点表情] 图片下载失败: ${error.message}`)
      throw error
    }
  },

  /**
   * 将图片 Buffer 转换为 Base64
   */
  async bufferToBase64 (buffer) {
    if (!buffer) throw new Error('图片 Buffer 不能为空')

    logger.info(`[星点表情] 开始转换 Buffer 为 Base64`)
    try {
      const base64Data = buffer.toString('base64')
      logger.info(`[星点表情] Base64 转换完成`)
      return base64Data
    } catch (error) {
      logger.error(`[星点表情] Base64 转换失败: ${error.message}`)
      throw error
    }
  },

  /**
   * 获取用户 QQ 头像
   */
  async getAvatar (qqList) {
    if (!qqList) throw new Error('QQ 号不能为空')
    if (!Array.isArray(qqList)) qqList = [qqList]

    const avatarUrl = (qq) => `https://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`
    const cacheDir = `${Version.Plugin_Path}/data/avatar`
    Data.createDir('data/avatar', '', false)

    const downloadAvatar = async (qq) => {
      const cachePath = `${cacheDir}/avatar_${qq}.jpg`

      if (Config.meme.cache && fs.existsSync(cachePath)) {
        logger.info(`[星点表情] 使用已缓存头像: QQ=${qq}, Path=${cachePath}`)
        try {
          const buffer = fs.readFileSync(cachePath)
          logger.info(`[星点表情] 已读取缓存头像 Buffer: QQ=${qq}`)
          return buffer
        } catch (error) {
          logger.error(`[星点表情] 读取缓存头像失败: QQ=${qq}, 错误: ${error.message}`)
          throw error
        }
      }

      logger.info(`[星点表情] 开始下载头像: QQ=${qq}, URL=${avatarUrl(qq)}`)
      try {
        const buffer = await Request.get(avatarUrl(qq), {}, 'arraybuffer')
        if (buffer && Buffer.isBuffer(buffer)) {
          fs.writeFileSync(cachePath, buffer)
          logger.info(`[星点表情] 头像下载完成: QQ=${qq}, Path=${cachePath}`)
          return buffer
        } else {
          throw new Error('头像下载返回了无效的数据')
        }
      } catch (error) {
        logger.error(`[星点表情] 下载头像失败: QQ=${qq}, 错误: ${error.message}`)
        throw error
      }
    }

    const results = await Promise.all(qqList.map((qq) => downloadAvatar(qq)))
    return qqList.length === 1 ? results[0] : results
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
          logger.info(`[星点表情] 已删除临时头像文件: ${filePath}`)
        }
      } catch (error) {
        logger.error(`[星点表情] 删除头像文件失败, 错误: ${error.message}`)
      }
    })
  }
}

export default Utils
