import { plugin, segment, logger } from '../components/Base/index.js'
import { Meme } from '../models/index.js'

export class list extends plugin {
  constructor () {
    super({
      name: '星点表情:列表',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: /^#?(星点表情|starlight-meme)列表$/i,
          fnc: 'list'
        }
      ]
    })
  }

  /*
   * 暂时先用服务端渲染发图
   */
  async list (e) {
    try {
      const imageBuffer = await Meme.request('memes/render_list', {}, 'POST', 'arraybuffer')
      await e.reply(segment.image(imageBuffer))
    } catch (error) {
      logger.error('获取表情列表失败:', error)
      await e.reply('获取表情列表失败')
    }
  }
}
