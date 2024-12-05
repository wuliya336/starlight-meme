import fs from 'fs'
import { pathToFileURL } from 'url'
import Version from '../Version.js'

/**
 * @type { import('node-karin').Update }
 */
const Update = await (async () => {
  if (Version.name === 'Karin') {
    return (await import('node-karin')).Update
  }
  const v3UpdatePath = `${Version.Path}/plugins/other/update.js`
  const v4UpdatePath = `${Version.Path}/plugins/system-plugin/apps/update.ts`
  let updateUrl
  if (fs.existsSync(v4UpdatePath)) {
    updateUrl = pathToFileURL(v4UpdatePath).href
  } else if (fs.existsSync(v3UpdatePath)) {
    updateUrl = pathToFileURL(v3UpdatePath).href
  } else {
    logger.error('未安装system-plugin (https://github.com/yunzai-org/system)，无法提供本体更新支持，请安装后重试！')
    return true
  }
  const { update: Update } = await import(updateUrl)
  return Update
})()

export default Update