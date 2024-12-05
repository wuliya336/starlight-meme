import Version from '../Version.js'

const segment = await (async () => {
  switch (Version.name) {
    case 'Karin':
      return (await import('node-karin')).segment
    default:
      return global.segment
  }
})()

export default segment
