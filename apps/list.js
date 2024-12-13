import { Config, Render } from '../components/index.js'
import { Meme } from '../models/index.js'

export class list extends plugin {
  constructor () {
    super({
      name: '清语表情:列表',
      event: 'message',
      priority: Config.other.priority,
      rule: [
        {
          reg: /^#?(清语表情|clarity-meme|表情)列表$/i,
          fnc: 'list'
        }
      ]
    })
  }

  /*
   * 使用本地数据直接渲染图片
   * @shiwuliya
   */
  async list (e) {
    try {

      const infoMap = Meme.infoMap || {}
      const keys = Object.keys(infoMap)

      if (!keys.length) {
        await e.reply('没有可用的表情列表。')
        return
      }

      const emojiList = keys.map(key => infoMap[key].keywords.join(', '))

      const img = await Render.render(
        'meme/index',
        {
          title: '清语表情列表',
          emojiList: emojiList
        })
      await e.reply(img)
    } catch (error) {
      logger.error('加载表情列表失败:', error)
      await e.reply('加载表情列表失败，请稍后重试。')
    }
  }
}
