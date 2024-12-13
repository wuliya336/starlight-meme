import { Config } from '../components/index.js'
import { Meme } from '../models/index.js'

export class search extends plugin {
  constructor () {
    super({
      name: '清语表情:搜索',
      event: 'message',
      priority: Config.other.priority,
      rule: [{
        reg: /^#?(清语表情|clarity-meme)搜索\s*(\S+)\s*$/i,
        fnc: 'search'
      }]
    })
  }

  async search (e) {
    try {
      const match = e.msg.match(this.rule[0].reg)
      const userQuery = match ? match[2].trim() : ''

      if (!userQuery) {
        await e.reply('请提供搜索的表情关键字。', true)
        return true
      }

      const { infoMap } = Meme

      if (!infoMap) {
        return true
      }

      let results = []
      let found = false

      /**
       * 通过 key 搜索
       */
      if (infoMap.hasOwnProperty(userQuery)) {
        results = infoMap[userQuery].keywords
        found = true
      }

      /**
       * 通过 关键词 搜索
       */
      if (!found) {
        for (let [key, info] of Object.entries(infoMap)) {
          for (let keyword of info.keywords) {
            if (keyword.toLowerCase().includes(userQuery.toLowerCase())) {
              results.push(keyword)
            }
          }
        }
      }

      if (results.length === 0) {
        await e.reply(`未找到与 "${userQuery}" 相关的表情。`, true)
        return true
      }


      let replyMessage = results.map((keyword, index) => `${index + 1}. ${keyword}`).join('\n')
      await e.reply(replyMessage, true)
      return true
    } catch (error) {
      logger.error(`搜索失败: ${error.message}`)
      await e.reply('搜索时发生错误，请稍后重试。', true)
      return true
    }
  }
}
