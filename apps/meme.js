import { plugin, logger } from '../components/Base/index.js'
import { Config } from '../components/index.js'
import { Meme } from '../models/index.js'

export class meme extends plugin {
  constructor () {
    super({
      name: '星点表情:表情包',
      event: 'message',
      priority: Infinity,
      rule: []
    })

    Meme.load()

    if (Meme.keyMap) {
      this.rule = Object.keys(Meme.keyMap).map((keyword) => {
        const prefix = Config.meme.forceSharp ? '^#' : '^#?'
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
      const fullKey = Config.meme.forceSharp ? `#${key}` : key
      return message.startsWith(fullKey)
    })

    if (!matchedKeyword) {
      return true
    }

    const memeKey = Meme.getKey(matchedKeyword)
    const memeInfo = Meme.getInfo(memeKey)

    if (!memeKey || !memeInfo) {
      return true
    }

    const { min_texts, min_images } = memeInfo.params_type || {}

    if (min_texts > 0) {
      // 文本规则处理
      return await Meme.text(e, memeKey, matchedKeyword, message)
    } else if (min_images > 0) {
      // 图片规则处理
      return await Meme.image(e, memeKey, memeInfo)
    }

    return true
  }
}
