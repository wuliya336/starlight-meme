import { Config } from '../components/index.js'
import { Meme, Rule } from '../models/index.js'

export class meme extends plugin {
  constructor () {
    super({
      name: '星点表情:表情包生成',
      event: 'message',
      priority: -20,
      rule: []
    })

    Meme.load()

    if (Meme.keyMap) {
      const prefix = Config.meme.forceSharp ? '^#' : '^#?'
      this.rule = Object.keys(Meme.keyMap).map((keyword) => {
        return {
          reg: new RegExp(`${prefix}(${keyword})(.*)`, 'i'),
          fnc: 'meme'
        }
      })
    } else {
      logger.error(`[星点表情] 初始化失败`)
    }
  }

  async meme (e) {

    const message = e.msg.trim()

    const matchedKeyword = Object.keys(Meme.keyMap).find((key) => {
      const regex = Config.meme.forceSharp
        ? new RegExp(`^#${key}`, 'i')
        : new RegExp(`^#?${key}`, 'i')
      return regex.test(message)
    })

    if (!matchedKeyword) {
      return false
    }

    const memeKey = Meme.getKey(matchedKeyword)
    const memeInfo = Meme.getInfo(memeKey)

    if (!memeKey || !memeInfo) {
      return false
    }

    const userText = message.replace(new RegExp(`^#?${matchedKeyword}`, 'i'), '').trim()
    return await Rule.meme(e, memeKey, memeInfo, userText)
  }
}
