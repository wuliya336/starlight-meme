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

    this.prefix = `${Config.meme.forceSharp ? '#' : '#?'}${Config.meme.default ? '' : '清语表情'}`

    if (Meme.keyMap) {
      this.rule = Object.keys(Meme.keyMap).map(keyword => ({
        reg: new RegExp(`${this.prefix}(${keyword})(.*)`, 'i'),
        fnc: 'meme'
      }))
    } else {
      logger.error('[清语表情] 初始化失败')
    }
  }

  async meme (e) {
    const message = e.msg.trim()
    const prefixRegex = new RegExp(`^${this.prefix}`)

    const matchedKeyword = Object.keys(Meme.keyMap).find(key =>
      prefixRegex.test(message) && new RegExp(key, 'i').test(message)
    )

    if (!matchedKeyword ||
        !Meme.getKey(matchedKeyword) ||
        Config.meme.blackList.includes(matchedKeyword.toLowerCase()) ||
        Config.meme.blackList.includes(Meme.getKey(matchedKeyword).toLowerCase()) ||
        !Meme.getInfo(Meme.getKey(matchedKeyword))) {
      return false
    }

    const memeKey = Meme.getKey(matchedKeyword)
    const memeInfo = Meme.getInfo(memeKey)
    const userText = message.replace(prefixRegex, '').trim().replace(new RegExp(`^${matchedKeyword}`, 'i'), '').trim()
    return await Rule.meme(e, memeKey, memeInfo, userText)
  }
}
