import { Version } from '../index.js'

/**
 * @type { import('node-karin').common }
 */
const common = await (async () => {
  switch (Version.name) {
    case 'Karin':
      return (await import('node-karin')).common
    case 'yunzai':
      return await import('yunzai')
    default:
      return (await import('../../../../lib/common/common.js')).default
  }
})()

export default common