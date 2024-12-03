import { Version, Init } from './components/index.js'
import { logger } from './components/Base/index.js'

let apps
if (Version.name !== 'Karin') {
  apps = await Init().catch(error => logger.error(error))
}
export { apps }
logger.info(logger.green('---------=.=---------'))
if (Version.name === 'Karin') {
  logger.info(logger.blue('居然是尊重的Karin用户'))
}
logger.info(logger.yellow(`星点表情插件${Version.ver}载入成功^_^`))
logger.info(logger.cyan(`雾里的小窝: 272040396`))
logger.info(logger.green('---------------------'))
