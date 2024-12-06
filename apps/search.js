import { plugin, logger } from '../components/Base/index.js'
import { Meme } from '../models/index.js'

export class search extends plugin {
  constructor () {
    super({
      name: '星点表情:搜索',
      event: 'message',
      priority: -20,
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
      if (!match) {
        logger.error(`[星点表情] 正则匹配失败，输入内容: ${e.msg}`)
        await e.reply('格式错误，请输入：#表情搜索 关键词', true)
        return
      }
      const userQuery = match[2].trim()

      if (!userQuery) {
        await e.reply('请提供搜索的表情', true)
        return
      }
      Meme.loadInfoMap()
      const infoMap = Meme.infoMap
      if (!infoMap || Object.keys(infoMap).length === 0) {
        logger.error('[星点表情] infoMap 加载失败或为空')
        await e.reply('表情数据未加载，请稍后再试', true)
        return
      }
      if (infoMap[userQuery]) {
        const info = infoMap[userQuery]
        const uniqueKeywords = Array.from(new Set(info.keywords))
        const replyMessage = uniqueKeywords.map((keyword, index) => {
          return `${index + 1}.${keyword}`
        }).join('\n')

        await e.reply(replyMessage, true)
        return
      }
      const results = Object.values(infoMap).filter((info) =>
        info.keywords.some((keyword) => keyword.includes(userQuery))
      )

      if (results.length === 0) {
        await e.reply(`未找到与 "${userQuery}" 相关的表情`, true)
        return
      }

      const uniqueKeywords = Array.from(
        new Set(results.flatMap((info) => info.keywords))
      )
      const replyMessage = uniqueKeywords.map((keyword, index) => {
        return `${index + 1}.${keyword}`
      }).join('\n')

      await e.reply(replyMessage, true)
    } catch (error) {
      logger.error(`[星点表情] 搜索失败: ${error.message}`)
      await e.reply('搜索时发生错误，请稍后重试', true)
    }
  }
}
