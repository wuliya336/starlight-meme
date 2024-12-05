import { Meme, Rule } from "../models/index.js"

export class random extends plugin {
  constructor () {
    super({
      name: "星点表情:随机表情包",
      event: "message",
      priority: 100,
      rule: [
        {
          reg: /^#?(星点表情|starlight-meme)随机表情(包)?$/i,
          fnc: "random"
        }
      ]
    })
    Meme.load()
  }

  async random (e) {
    try {
      const memeKeys = Object.keys(Meme.keyMap)
      if (memeKeys.length === 0) {
        return false
      }

      const randomKey = memeKeys[Math.floor(Math.random() * memeKeys.length)]
      const memeKey = Meme.getKey(randomKey)

      if (!memeKey) {
        return false
      }

      const memeInfo = Meme.getInfo(memeKey)

      if (!memeInfo) {
        return false
      }

      const { min_texts, max_texts, min_images, max_images, args_type } =
        memeInfo.params_type || {}

      const isValid =
        ((min_texts === 1 && max_texts === 1) ||
          (min_images === 1 && max_images === 1) ||
          (min_texts === 1 && min_images === 1) ||
          (args_type && (min_texts === 1 || min_images === 1)))

      if (!isValid) {
        return false
      }


      await Rule.meme(e, memeKey, memeInfo, "")
    } catch (error) {
      logger.error(`[星点表情] 随机表情处理失败: ${error.message}`)
      await e.reply(`生成随机表情时出错: ${error.message}`, true)
    }
  }
}
