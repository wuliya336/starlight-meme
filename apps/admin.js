import { Config, Render } from '../components/index.js'
import lodash from 'lodash'

let keys = lodash.map(Config.getCfgSchemaMap(), (i) => i.key)
let sysCfgReg = new RegExp(`^#清语表情设置\\s*(${keys.join('|')})?\\s*(.*)$`)

export class setting extends plugin {
  constructor () {
    super({
      name: '清语表情:设置',
      event: 'message',
      priority: -20,
      rule: [
        {
          reg: sysCfgReg,
          fnc: 'setting'
        }
      ]
    })
  }

  async setting (e) {
    if (!this.e.isMaster) {
      return true
    }
    let cfgReg = sysCfgReg
    let regRet = cfgReg.exec(e.msg)
    let cfgSchemaMap = Config.getCfgSchemaMap()
    if (!regRet) {
      return true
    }

    if (regRet[1]) {
      // 设置模式
      let val = regRet[2] || ''

      if (regRet[1] == '全部') {
        val = !/关闭/.test(val)
        for (const i of keys) {
          if (typeof cfgSchemaMap[i].def == 'boolean') {
            if (cfgSchemaMap[i].key == '全部') {
              await redis.set('Yz:clarity-meme:setAll', val ? 1 : 0)
            } else {
              Config.modify(
                cfgSchemaMap[i].fileName,
                cfgSchemaMap[i].cfgKey,
                val
              )
            }
          }
        }
      } else {
        let cfgSchema = cfgSchemaMap[regRet[1]]
        if (cfgSchema.type !== 'array') {
          if (cfgSchema.input) {
            val = cfgSchema.input(val)
          } else if (cfgSchema.type === 'number') {
            val = val * 1 || cfgSchema.def
          } else if (cfgSchema.type === 'boolean') {
            val = !/关闭/.test(val)
          } else if (cfgSchema.type === 'string') {
            val = val.trim() || cfgSchema.def
          }
          Config.modify(cfgSchema.fileName, cfgSchema.cfgKey, val)
        }
      }

      let schema = Config.getCfgSchema()
      let cfg = Config.getCfg()
      cfg.setAll = (await redis.get('Yz:clarity-meme:setAll')) == 1

      // 渲染图像
      const img = await Render.render(
        'admin/index',
        {
          schema,
          cfg
        },
        { e, scale: 1.4 }
      )
      await e.reply(img)
      return true
    }
  }
}
