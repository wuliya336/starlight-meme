import { Config } from '../components/index.js'
import { Meme, Rule } from '../models/index.js'

export class MemePlugin extends plugin {
  constructor () {
    super({
      name: '清语表情:表情包生成',
      event: 'message',
      priority: -Infinity,
      rule: []
    })

    this.loadRule()
  }

  loadRule () {
    if (!Meme.keyMap) {
      logger.error('[清语表情] 初始化失败')
      return
    }

    this.rule = Object.keys(Meme.keyMap).map(keyword => ({
      reg: new RegExp(`${this.getPrefix()}(${keyword})(.*)`, 'i'),
      fnc: 'meme'
    }))
  }

  getPrefix () {
    const sharpPrefix = Config.meme.forceSharp ? '#' : '#?'
    const defaultPrefix = !Config.meme.default ? '清语表情' : ''
    return `${sharpPrefix}${defaultPrefix}`
  }

  async meme (e) {
    const message = e.msg.trim()
    const prefix = this.getPrefix()
    const prefixRegex = new RegExp(`^${prefix}`)

    const matchedKeyword = Object.keys(Meme.keyMap).find(key =>
      prefixRegex.test(message) && new RegExp(key, 'i').test(message)
    )

    if (!matchedKeyword) return true

    const memeKey = Meme.getKey(matchedKeyword)
    if (this.isBlacklisted(memeKey)) return true

    const memeInfo = Meme.getInfo(memeKey)
    if (!memeInfo) return true

    const userText = this.finallUserText(message, matchedKeyword, prefixRegex)
    return await Rule.meme(e, memeKey, memeInfo, userText)
  }

  isBlacklisted (keyword) {
    return Config.meme.blackList.includes(keyword.toLowerCase())
  }

  finallUserText (message, keyword, prefixRegex) {
    return message.replace(prefixRegex, '').trim().replace(new RegExp(`^${keyword}`, 'i'), '').trim()
  }
}
