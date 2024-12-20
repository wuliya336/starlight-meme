import Meme from './meme.js'
import Utils from './utils.js'
import { Config } from '../components/index.js'
import FormData from 'form-data'
import Args from './args.js'

const Rule = {
  /**
   * 表情处理逻辑
   */
  async meme (e, memeKey, memeInfo, userText) {
    const { params_type } = memeInfo || {}

    const {
      min_texts,
      max_texts,
      min_images,
      max_images,
      default_texts,
      args_type
    } = params_type

    const formData = new FormData()
    let images = []
    let finalTexts = []
    let argsString = null

    try {
      /**
       * 针对仅图片类型表情作特殊处理
       */
      if (min_texts === 0 && max_texts === 0 && args_type === null && userText) {
        const isValidInput = /^@\s*\d+(\s*@\s*\d+)*$/.test(userText.trim())
        if (!isValidInput) {
          return false
        }
      }

      /**
       * 通用处理
       */
      let userAvatars = []
      const atMatches = userText.matchAll(/@\s*(\d+)/g)
      for (const match of atMatches) {
        userAvatars.push(match[1])
      }
      userText = userText.replace(/@\s*\d+/g, '').trim()

      /**
       * 处理 args 参数类型表情
       */
      if (args_type !== null) {
        const argsMatch = userText.match(/#(.+)/)
        if (argsMatch) {
          const message = argsMatch[1].trim()
          if (message) {
            argsString = Args.handle(memeKey, message)
            formData.append('args', argsString)
          }
          userText = userText.replace(/#.+/, '').trim()
        }
      }

      /**
       * 处理图片类型表情
       */
      if (!(min_images === 0 && max_images === 0)) {
        let shouldProtect = false
        if (Config.protect.enable) {
          const protectList = []
          for (const item of Config.protect.list) {
            const key = Meme.getKey(item)
            if (key) {
              protectList.push(key.toLowerCase())
            } else {
              const keywordKey = Meme.getKey(item)
              if (keywordKey) {
                protectList.push(keywordKey.toLowerCase())
              }
            }
          }
          const isProtectedMeme = protectList.includes(memeKey.toLowerCase())

          /**
           * 主人保护
           */
          if (Config.protect.master && isProtectedMeme && e.user_id !== Config.masterQQ) {
            shouldProtect = true
          }
          /**
           * 用户保护

           */
          if (!shouldProtect && Config.protect.userEnable && isProtectedMeme && Config.protect.user.includes(e.user_id.toString())) {
            shouldProtect = true
          }
        }

        if (userAvatars.length > 0) {
          for (const userAvatar of userAvatars) {
            const avatarBuffer = await Utils.getAvatar(userAvatar)
            if (avatarBuffer) images.push(...avatarBuffer)
          }

          if (images.length < min_images && !shouldProtect) {
            const triggerAvatar = await Utils.getAvatar(e.user_id)
            if (triggerAvatar) images.unshift(...triggerAvatar)
          }
        } else {
          images = await Utils.getImage(e, userText, max_images, min_images)
          if (images.length < min_images && !shouldProtect) {
            const triggerAvatar = await Utils.getAvatar(e.user_id)
            if (triggerAvatar) images.unshift(...triggerAvatar)
          }
        }

        if (images.length < min_images) {
          return e.reply(`该表情至少需要 ${min_images} 张图片`, true)
        }

        images = images.slice(0, max_images)

        images.forEach((buffer, index) => {
          formData.append('images', buffer, `image${index}.jpg`)
        })
      }

      /**
 * 处理文本类型表情
 */
      if (!(min_texts === 0 && max_texts === 0)) {
        if (userText) {
          const splitTexts = userText.split('/').map((text) => text.trim())
          finalTexts = splitTexts.slice(0, max_texts)
        }

        const ats = e.message.filter((m) => m.type === 'at').map((at) => at.qq)

        if (finalTexts.length === 0 && ats.length >= 1) {
          const firstAtUser = ats[0]
          const firstAtUserNickname = await Utils.getNickname(firstAtUser, e)
          finalTexts.push(firstAtUserNickname)
        } else if (finalTexts.length === 0 && Config.meme.userName) {
          const senderNickname = await Utils.getNickname(e.sender.user_id, e)
          finalTexts.push(senderNickname)
        } else if (
          finalTexts.length === 0 &&
          !Config.meme.userName &&
          default_texts &&
          default_texts.length > 0
        ) {
          const randomIndex = Math.floor(Math.random() * default_texts.length)
          finalTexts.push(default_texts[randomIndex])
        }

        if (finalTexts.length === 0) {
          const senderNickname = await Utils.getNickname(e.sender.user_id, e)
          finalTexts.push(senderNickname)
        }

        if (finalTexts.length < min_texts) {
          return e.reply(`该表情至少需要 ${min_texts} 个文字描述`, true)
        }

        finalTexts.forEach((text) => {
          formData.append('texts', text)
        })
      }



      /**
       * 检查是否包含所需的内容
       */
      if (min_images > 0 && images.length === 0) {
        return e.reply(`该表情至少需要 ${min_images} 张图片`, true)
      }

      if (min_texts > 0 && finalTexts.length < min_texts) {
        return e.reply(`该表情至少需要 ${min_texts} 个文字描述`, true)
      }

      const endpoint = `memes/${memeKey}/`
      const result = await Meme.request(
        endpoint,
        formData,
        'POST',
        'arraybuffer'
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
      logger.error(`[清语表情] 表情生成失败: ${error.message}`)
      await e.reply(`生成表情包失败: ${error.message}`)
      return true
    }
  }

}

export default Rule
