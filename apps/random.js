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

  /**
   * 处理随机表情命令
   */
  async random (e) {
    try {
      const memeKeys = Object.keys(Meme.keyMap)
      if (memeKeys.length === 0) {
        return false
      }

      const randomKey = memeKeys[Math.floor(Math.random() * memeKeys.length)]
      const memeInfo = Meme.getInfo(randomKey)

      if (!memeInfo) {
        return false
      }

      const userText = ""

      const img = await Rule.meme(e, randomKey, memeInfo, userText)
      await e.reply(img)
    } catch (error) {
      logger.error(`[星点表情] 随机表情处理失败: ${error.message}`)
      await e.reply(`生成随机表情时出错: ${error.message}`, true)
    }
  }
}
