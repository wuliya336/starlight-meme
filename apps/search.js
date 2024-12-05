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
          reg: /^#?(星点表情|starlight-meme)搜索\s*(.*)$/i,
          fnc: 'search'
        }
      ]
    })
  }

  async search (e) {
    try {
      const userQuery = e.msg.replace(/^#?(星点表情|starlight-meme)搜索\s*/i, '').trim()

      if (!userQuery) {
        await e.reply('请提供搜索的表情', true)
        return false
      }

      Meme.loadInfoMap()
      const infoMap = Meme.infoMap

      if (!infoMap) {
        return false
      }

      if (infoMap[userQuery]) {
        const info = infoMap[userQuery]
        const uniqueKeywords = Array.from(new Set(info.keywords))
        const replyMessage = uniqueKeywords.map((keyword, index) => {
          return `${index + 1}.${keyword}`
        }).join('\n')

        await e.reply(replyMessage, true)
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
      const replyMessage = uniqueKeywords.map((keyword, index) => {
        return `${index + 1}.${keyword}`
      }).join('\n')

      await e.reply(replyMessage, true)
      return true
    } catch (error) {
      logger.error(`[星点表情] 搜索失败: ${error.message}`)
      await e.reply('搜索时发生错误，请稍后重试', true)
      return true
    }
  }
}
