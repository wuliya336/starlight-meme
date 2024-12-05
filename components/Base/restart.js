import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { Version } from '../index.js'
import logger from './logger.js'

const Restart = await (async () => {
  switch (Version.name) {
    case 'Karin': {
      /**
       * @param bot_id 机器人的id 传e.self_id
       * @param contact 消息来源的联系人 传e.contact
       * @param message_id 消息id 传e.message_id
       * @param isFront 是否前台 默认true
       */
      return async (bot_id, contact, message_id, isFront = true) => {
        try {
          return (await import('node-karin')).restart(bot_id, contact, message_id, isFront)
        } catch (error) {
          logger.error('导入Karin模型失败:', error)
          return false
        }
      }
    }
    default: {
      const v3RestartPath = `${Version.path}/plugins/other/restart.js`
      if (fs.existsSync(v3RestartPath)) {
        const restartUrl = pathToFileURL(v3RestartPath).href
        const { Restart } = await import(restartUrl)
        return Restart
      }
    }
  }
})()

export default Restart