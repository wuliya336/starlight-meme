import { Render } from '../components/index.js'
import { Meme } from '../models/index.js'

export class list extends plugin {
  constructor () {
    super({
      name: '清语表情:列表',
      event: 'message',
      priority: -20,
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
      Meme.loadKeyMap()

      const keyMap = Meme.keyMap || {}
      const keys = Object.keys(keyMap)

      if (!keys.length) {
        return
      }

      const img = await Render.render(
        'meme/index',
        {
          title: '清语表情列表',
          emojiList: keys
        })
      await e.reply(img)
    } catch (error) {
      logger.error('加载表情列表失败:', error)
      await e.reply('加载表情列表失败，请稍后重试。')
    }
  }
}
