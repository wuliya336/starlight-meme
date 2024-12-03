import { plugin, segment, logger } from '../components/Base/index.js'
import { Meme, Utils } from '../models/index.js'

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
   * 这里先使用服务端渲染图片
   */
  async list (e) {
    try {
      const imageBuffer = await Meme.request('memes/render_list', {}, 'POST', 'arraybuffer')
      const base64Data = await Utils.bufferToBase64(imageBuffer)
      
      await e.reply(segment.image(`base64://${base64Data}`))
    } catch (error) {
      logger.error('获取表情列表失败:', error)
      await e.reply('获取表情列表失败')
    }
  }
}
