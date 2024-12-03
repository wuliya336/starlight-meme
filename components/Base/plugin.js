import { Version } from '../index.js'

const plugin = await (async () => {
  switch (Version.name) {
    case 'Karin':
      return (await import('node-karin')).Plugin
    default:
      return global.plugin
  }
})()

export default plugin
