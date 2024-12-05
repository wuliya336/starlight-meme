import Meme from "./meme.js"
import Utils from "./utils.js"
import { Config } from "../components/index.js"
import { logger, segment } from "../components/Base/index.js"
import FormData from "form-data"

const Rule = {
  /**
   * 表情处理逻辑
   */
  async meme (e, memeKey, memeInfo, userText) {
    const { min_texts, min_images, max_images, default_texts } =
      memeInfo.params_type || {}
    let formData = new FormData()
    let hasTexts = false
    let hasImages = false
    let images = []

    try {
      /**
       * 针对仅图片类型作特殊处理
       */
      if (min_images > 0 && min_texts === 0) {
        if (/[^@\d\s]/.test(userText)) {
          //   await e.reply('仅允许输入@+数字的格式或提供图片', true)
          return false
        }
      }

      /**
       * 处理图片类型表情包
       */
      if (min_images > 0) {
        images = await Utils.getImage(e, userText)

        if (images.length < min_images) {
          const triggerAvatar = await Utils.getAvatar(e.user_id)
          if (triggerAvatar) images.unshift(triggerAvatar)
        }

        if (images.length < min_images) {
          return e.reply(`该表情至少需要 ${min_images} 张图片`, true)
        }

        images = images.slice(0, max_images)

        images.forEach((buffer, index) => {
          formData.append("images", buffer, `image${index}.jpg`)
        })

        hasImages = images.length > 0
      }

      /**
       * 处理文本类型表情包
       */
      if (min_texts > 0) {
        let finalText = userText || ""

        if (!finalText) {
          if (Config.meme.defaultText === 1) {
            finalText = e.sender.nickname || "未知"
          } else if (Array.isArray(default_texts) && default_texts.length > 0) {
            const randomIndex = Math.floor(Math.random() * default_texts.length)
            finalText = default_texts[randomIndex]
          }
        }

        if (!finalText || finalText.length === 0) {
          return e.reply(`该表情至少需要 ${min_texts} 个文字描述`, true)
        }

        formData.append("texts", finalText)
        hasTexts = true
      }

      /**
       * 检查是否提供了必要的内容
       */
      if (!hasTexts && !hasImages) {
        return e.reply(
          `该表情至少需要 ${min_images} 张图片，${min_texts} 个文字描述`,
          true
        )
      }

      /**
       * 发送请求生成表情包
       */
      const endpoint = `memes/${memeKey}/`
      const result = await Meme.request(
        endpoint,
        formData,
        "POST",
        "arraybuffer"
      )

      if (Buffer.isBuffer(result)) {
        const base64Image = await Utils.bufferToBase64(result)
        await e.reply(
          segment.image(`base64://${base64Image}`),
          Config.meme.reply
        )
      } else {
        await e.reply(segment.image(result), Config.meme.reply)
      }

      return true
    } catch (error) {
      logger.error(`[星点表情] 表情生成失败: ${error.message}`)
      await e.reply(`生成表情包失败: ${error.message}`)
      return true
    }
  }
}

export default Rule
