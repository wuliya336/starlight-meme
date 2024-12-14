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
    if (!Config.meme.enable) { return true }

    const message = e.msg.trim()
    let matchedKeyword = null

    this.rule.some(rule => {
      const match = message.match(rule.reg)
      if (match) {
        matchedKeyword = match[1]
        return true
      }
      return true
    })

    if (!matchedKeyword) return true

    const memeKey = Meme.getKey(matchedKeyword)

    if (!memeKey) {
      return true
    }

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
