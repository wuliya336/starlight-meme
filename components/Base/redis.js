import Version from '../Version.js'

const redis = await (async () => {
  switch (Version.name) {
    case 'Karin':
      return (await import('node-karin')).redis
    default:
      return global.redis
  }
})()

export default redis
