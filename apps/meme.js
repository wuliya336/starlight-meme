import { Config } from '../components/index.js'
import { Meme, Rule } from '../models/index.js'

export class meme extends plugin {
  constructor () {
    super({
      name: '清语表情:表情包生成',
      event: 'message',
      priority: -Infinity,
      rule: []
    })
    const prefix = Config.meme.forceSharp ? '^#' : '^#?'
    Object.entries(Meme.infoMap).forEach(([key, value]) => {
      value.keywords.forEach(keyword => {
        this.rule.push({
          reg: new RegExp(`${prefix}(${keyword})(.*)`, 'i'),
          fnc: 'meme'
        })
      })
    })
  }

  async meme (e) {
    if (!Config.meme.Enable) return false

    const message = e.msg.trim()
    let matchedKeyword = null

    this.rule.some(rule => {
      const match = message.match(rule.reg)
      if (match) {
        matchedKeyword = match[1]
        return true
      }
      return false
    })

    if (!matchedKeyword) return true



    const memeKey = Meme.getKey(matchedKeyword)

    if (!memeKey) {
      return true
    }

    if (Config.access.enable) {
      const userId = e.user_id

      /**
       * 黑名名单
       */
      if (Config.access.mode === 0) {
        /**
         * 白名单模式
         */
        if (!Config.access.userWhiteList.includes(userId)) {
          return true
        }
      } else if (Config.access.mode === 1) {
        /**
         * 黑名单模式
         */
        if (Config.access.userBlackList.includes(userId)) {
          return true
        }
      }
    }
    /**
     * 禁用表情列表
     */
    if (Config.access.blackListEnable) {
      if (
        Config.access.blackList.includes(matchedKeyword.toLowerCase()) ||
        Config.access.blackList.includes(memeKey.toLowerCase())
      ) {
        return true
      }
    }
    if (!Meme.getInfo(memeKey)) {
      return true
    }

    const memeInfo = Meme.getInfo(memeKey)
    const userText = message.replace(new RegExp(`^#?${matchedKeyword}`, 'i'), '').trim()
    return await Rule.meme(e, memeKey, memeInfo, userText)
  }
}
