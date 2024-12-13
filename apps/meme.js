import { Config } from '../components/index.js'
import { Meme, Rule } from '../models/index.js'

export class meme extends plugin {
  constructor () {
    super({
      name: '清语表情:表情包生成',
      event: 'message',
      priority: Config.other.priority,
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
    if (!Config.meme.enable) { return false }

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

    if (!matchedKeyword) return false

    const memeKey = Meme.getKey(matchedKeyword)
    if (!memeKey ||
        Config.meme.blackList.includes(matchedKeyword.toLowerCase()) ||
        Config.meme.blackList.includes(memeKey.toLowerCase()) ||
        !Meme.getInfo(memeKey)) {
      return false
    }

    const memeInfo = Meme.getInfo(memeKey)
    const userText = message.replace(new RegExp(`^#?${matchedKeyword}`, 'i'), '').trim()
    return await Rule.meme(e, memeKey, memeInfo, userText)
  }
}
