import { Version, Config } from '../components/index.js'
import { update as Update } from '../../other/update.js'
import { Utils } from '../models/index.js'
export class update extends plugin {
  constructor () {
    super({
      name: '清语表情:更新',
      event: 'message',
      priority: Config.other.priority,
      rule: [
        {
          reg: /^#?(清语表情|clarity-meme)(插件)?(强制)?更新$/i,
          fnc: 'update'
        },
        {
          reg: /^#?(清语表情|clarity-meme)?更新日志$/i,
          fnc: 'updateLog'
        },
        {
          reg: /^#?(清语表情|clarity-meme)?资源更新$/i,
          fnc: 'updateRes'
        }
      ]
    })
  }

  async update (e = this.e) {
    const Type = e.msg.includes('强制') ? '#强制更新' : '#更新'
    e.msg = Type + Version.Plugin_Name
    const up = new Update(e)
    up.e = e
    return up.update()
  }

  async updateLog (e = this.e) {
    e.msg = '#更新日志' + Version.Plugin_Name
    const up = new Update(e)
    up.e = e
    return up.updateLog()
  }

  async updateRes (e) {
    try {
      if (!Config.meme.url) {
        await Utils.downloadMemeData(forceUpdate)
      } else {
        await Utils.generateMemeData(forceUpdate)
      }
      await e.reply('表情包数据更新成功, 请稍后重启以应用')
    } catch (error) {
      logger.error(`表情包数据更新出错: ${error.message}`)
      await e.reply(`表情包数据更新失败: ${error.message}`)
    }
  }
}
