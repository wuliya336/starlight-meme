
import lodash from 'lodash'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)
const Path = process.cwd()
const Plugin_Path = join(__dirname, '..').replace(/\\/g, '/')

const getRoot = (root = '') => {
  if (root === 'root' || root === 'yunzai') {
    root = `${Path}/`
  } else if (!root) {
    root = `${Plugin_Path}/`
  }
  return root
}

let Data = {
  /*
   * 根据指定的path依次检查与创建目录
   */
  createDir (path = '', root = '', includeFile = false) {
    root = getRoot(root)
    let pathList = path.split('/')
    let nowPath = root
    pathList.forEach((name, idx) => {
      name = name.trim()
      if (!includeFile && idx <= pathList.length - 1) {
        nowPath += name + '/'
        if (name) {
          if (!fs.existsSync(nowPath)) {
            fs.mkdirSync(nowPath)
          }
        }
      }
    })
  },

  /*
   * 读取JSON
   */
  readJSON (file = '', root = '') {
    root = getRoot(root)
    if (fs.existsSync(`${root}/${file}`)) {
      try {
        return JSON.parse(fs.readFileSync(`${root}/${file}`, 'utf8'))
      } catch (e) {
        console.error(`读取 JSON 文件失败: ${file}`, e)
      }
    }
    return {}
  },

  /*
   * 写JSON
   */
  writeJSON (file, data, space = '\t', root = '') {
    // 检查并创建目录
    Data.createDir(file, root, true)
    root = getRoot(root)
    delete data._res
    return fs.writeFileSync(
      `${root}/${file}`,
      JSON.stringify(data, null, space)
    )
  },

  async getCacheJSON (key) {
    try {
      let txt = await redis.get(key)
      if (txt) {
        return JSON.parse(txt)
      }
    } catch (e) {
      console.error('获取缓存 JSON 失败:', e)
    }
    return {}
  },

  async setCacheJSON (key, data, EX = 3600 * 24 * 90) {
    await redis.set(key, JSON.stringify(data), { EX })
  },

  async importModule (file, root = '') {
    root = getRoot(root)
    if (!/\.js$/.test(file)) {
      file = file + '.js'
    }
    if (fs.existsSync(`${root}/${file}`)) {
      try {
        let data = await import(`file://${root}/${file}?t=${new Date() * 1}`)
        return data || {}
      } catch (e) {
        console.error('模块导入失败:', e)
      }
    }
    return {}
  },

  async importDefault (file, root) {
    let ret = await Data.importModule(file, root)
    return ret.default || {}
  },

  async importCfg (key) {
    let sysCfg = await Data.importModule(`config/system/${key}_system.js`)
    let diyCfg = await Data.importModule(`config/${key}.js`)
    if (diyCfg.isSys) {
      diyCfg = {}
    }
    return {
      sysCfg,
      diyCfg
    }
  },

  /*
   * 返回一个从 target 中选中的属性的对象
   */
  getData (target, keyList = '', cfg = {}) {
    target = target || {}
    let defaultData = cfg.defaultData || {}
    let ret = {}
    // 分割逗号
    if (typeof keyList === 'string') {
      keyList = keyList.split(',')
    }

    lodash.forEach(keyList, (keyCfg) => {
      // 处理通过:指定 toKey & fromKey
      let _keyCfg = keyCfg.split(':')
      let keyTo = _keyCfg[0].trim()
      let keyFrom = (_keyCfg[1] || _keyCfg[0]).trim()
      let keyRet = keyTo
      if (cfg.lowerFirstKey) {
        keyRet = lodash.lowerFirst(keyRet)
      }
      if (cfg.keyPrefix) {
        keyRet = cfg.keyPrefix + keyRet
      }
      // 通过 Data.getVal 获取数据
      ret[keyRet] = Data.getVal(target, keyFrom, defaultData[keyTo], cfg)
    })
    return ret
  },

  getVal (target, keyFrom, defaultValue) {
    return lodash.get(target, keyFrom, defaultValue)
  },

  // 异步池，聚合请求
  async asyncPool (poolLimit, array, iteratorFn) {
    const ret = [] // 存储所有的异步任务
    const executing = [] // 存储正在执行的异步任务
    for (const item of array) {
      // 调用 iteratorFn 函数创建异步任务
      const p = Promise.resolve().then(() => iteratorFn(item, array))
      // 保存新的异步任务
      ret.push(p)

      // 当 poolLimit 值小于或等于总任务个数时，进行并发控制
      if (poolLimit <= array.length) {
        // 当任务完成后，从正在执行的任务数组中移除已完成的任务
        const e = p.then(() => executing.splice(executing.indexOf(e), 1))
        executing.push(e) // 保存正在执行的异步任务
        if (executing.length >= poolLimit) {
          // 等待较快的任务执行完成
          await Promise.race(executing)
        }
      }
    }
    return Promise.all(ret)
  },

  // sleep
  sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },

  // 获取默认值
  def () {
    for (let idx in arguments) {
      if (!lodash.isUndefined(arguments[idx])) {
        return arguments[idx]
      }
    }
  },

  // 循环字符串回调
  eachStr: (arr, fn) => {
    if (lodash.isString(arr)) {
      arr = arr.replace(/\s*(;|；|、|，)\s*/, ',')
      arr = arr.split(',')
    } else if (lodash.isNumber(arr)) {
      arr = [arr.toString()]
    }
    lodash.forEach(arr, (str, idx) => {
      if (!lodash.isUndefined(str)) {
        fn(str.trim ? str.trim() : str, idx)
      }
    })
  },

  regRet (reg, txt, idx) {
    if (reg && txt) {
      let ret = reg.exec(txt)
      if (ret && ret[idx]) {
        return ret[idx]
      }
    }
    return false
  }
}

export default Data
