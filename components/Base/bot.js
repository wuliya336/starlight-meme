import Version from '../Version.js'

const Bot = await (async () => {
  switch (Version.name) {
    case 'Karin':
      return (await import('node-karin')).default
    default:
      return global.Bot
  }
})()

export default Bot
