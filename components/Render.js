import Version from './Version.js'
import Config from './Config.js'

const Render = {
  async render (path, params, cfg) {
    let { e } = cfg
    if (!e.runtime) {
      console.log('未找到e.runtime，请升级至最新版Yunzai')
    }
    return e.runtime.render(`${Version.Plugin_Name}`, path, params, {
      retType: cfg.retMsgId ? 'msgId' : 'default',
      beforeRender ({ data }) {
        let resPath = data.pluResPath
        const layoutPath = `${Version.Plugin_Path}/resources/common/layout/`
        const scale= (pct = 1) => {
          const renderScale = Config.other?.renderScale || 100
          const scale = Math.min(2, Math.max(0.5, renderScale / 100))
          pct = pct * scale
          return `style=transform:scale(${pct})`
        }

        return {
          ...data,
          _res_path: resPath,
          _layout_path: layoutPath,
          defaultLayout: layoutPath + 'default.html',
          elemLayout: layoutPath + 'elem.html',
          sys: {
            scale: scale(cfg.scale || 1)
          },
          copyright: `${Version.name}<span class="version"> ${Version.bot}</span> & ${Version.Plugin_Name}<span class="version"> ${Version.ver}`
        }
      }
    })
  }
}

export default Render