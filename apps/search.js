import { plugin, logger } from '../components/Base/index.js'
import { Meme } from '../models/index.js'

export class search extends plugin {
  constructor () {
    super({
      name: '星点表情:搜索',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: /^#?(星点表情|starlight-meme|表情)搜索\s*(\S.*)$/i,
          fnc: 'search'
        }
      ]
    })
  }

  async search (e) {
    try {
      const match = e.msg.match(/^#?(星点表情|starlight-meme|表情)搜索\s*(\S.*)$/i)
      const userQuery = match ? match[2].trim() : ''

      if (!userQuery) {
        await e.reply('请提供搜索的表情', true)
        return false
      }

      Meme.loadInfoMap()
      const infoMap = Meme.infoMap

      if (!infoMap) {
        return false
      }

      let replyMessage = []

      if (infoMap[userQuery]) {
        const info = infoMap[userQuery]
        const uniqueKeywords = Array.from(new Set(info.keywords))

        replyMessage.push('\n')
        uniqueKeywords.forEach((keyword, index) => {
          replyMessage.push(`${index + 1}. ${keyword}`)
        })

        await e.reply(replyMessage.join('\n'), true)
        return true
      }

      const results = Object.values(infoMap).filter((info) =>
        info.keywords.some((keyword) => keyword.includes(userQuery))
      )

      if (results.length === 0) {
        await e.reply(`未找到与 "${userQuery}" 相关的表情`, true)
        return true
      }

      const uniqueKeywords = Array.from(
        new Set(results.flatMap((info) => info.keywords))
      )
      replyMessage.push('\n')
      uniqueKeywords.forEach((keyword, index) => {
        replyMessage.push(`${index + 1}. ${keyword}`)
      })

      await e.reply(replyMessage.join('\n'), true)
      return true
    } catch (error) {
      logger.error(`[星点表情] 搜索失败: ${error.message}`)
      await e.reply('搜索时发生错误，请稍后重试', true)
      return true
    }
  }
}
