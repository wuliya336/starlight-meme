import Version from '../Version.js'
import common from './common.js'

const makeForwardMsg = await (async () => {
  switch (Version.name) {
    case 'Karin':
      return async (e, elements) => {
        return common.makeForward(elements, e.self_id, e.sender.name || e.sender.nick)
      }
    case 'yunzai':
      return (await import('yunzai')).makeForwardMsg
    default:
      return (await import('../../../../lib/common/common.js')).default.makeForwardMsg
  }
})()

export default makeForwardMsg