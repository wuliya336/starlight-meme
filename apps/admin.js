import { Config, Render } from '../components/index.js'
import lodash from 'lodash'

let keys = lodash.map(Config.getCfgSchemaMap(), (i) => i.key)
let sysCfgReg = new RegExp(`^#星点表情设置\\s*(${keys.join('|')})?\\s*(.*)$`)

export class setting extends plugin {
  constructor () {
    super({
      name: '星点表情:设置',
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
              await redis.set('Yz:starlight-meme:setAll', val ? 1 : 0)
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
        if (cfgSchema.input) {
          val = cfgSchema.input(val)
        } else {
          val =
            cfgSchema.type === 'num'
              ? val * 1 || cfgSchema.def
              : !/关闭/.test(val)
        }
        Config.modify(cfgSchema.fileName, cfgSchema.cfgKey, val)
      }
    }

    let schema = Config.getCfgSchema()
    let cfg = Config.getCfg()
    cfg.setAll = (await redis.get('Yz:starlight-meme:setAll')) == 1

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
