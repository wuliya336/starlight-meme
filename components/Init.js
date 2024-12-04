import fs from 'fs'
import Version from './Version.js'
import logger from './Base/logger.js'
import chalk from 'chalk'

export default async () => {
  const files = fs
    .readdirSync(`${Version.Plugin_Path}/apps`)
    .filter(file => file.endsWith('.js'))

  let ret = []

  files.forEach(file => {
    ret.push(import(`../apps/${file}`))
  })

  ret = await Promise.allSettled(ret)

  const apps = {}

  const separator = chalk.bold.rgb(80, 200, 120)('✨'.repeat(30))

  for (const i in files) {
    const name = files[i].replace('.js', '')

    if (ret[i].status !== 'fulfilled') {
      logger.error(
        chalk.bgRgb(255, 0, 0).white.bold(' ❌ 载入插件错误：') +
        chalk.redBright(` ${name} `) +
        ' 🚫'
      )
      logger.error(chalk.red(`📄 错误详情： ${ret[i].reason}`))
      continue
    }

    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
  }
  return apps
}