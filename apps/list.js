import { plugin, segment, logger } from '../components/Base/index.js'
import { Request } from '../models/index.js'

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
 * 暂时先用服务端获取来渲染表情列表
 */
  async list (e) {
    try {
      const imageBuffer = await Request.post('memes/render_list', {}, 'arraybuffer')

      await e.reply(segment.image(imageBuffer))
    } catch (error) {
      logger.error('获取表情列表失败:', error)
      await e.reply('获取表情列表失败')
    }
  }
}
