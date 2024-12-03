import fs from 'fs'
import _ from 'lodash'
import Data from './Data.js'
import { fileURLToPath } from 'url'
import { join, dirname, basename } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const Path = process.cwd()
const Plugin_Path = join(__dirname, '..').replace(/\\/g, '/')
const Plugin_Name = basename(Plugin_Path)

let packageJson = {}
packageJson = Data.readJSON('package.json', `${Plugin_Path}/${Plugin_Name}}`)

let changelogs = []
let currentVersion = ''
const versionCount = 3
const getLine = (line) => {
  return line
    .replace(/(^\s*[\\*\\-]|\r)/g, '')
    .replace(/\s*`([^`]+)`/g, '<span class="cmd">$1</span>')
    .replace(/\*\*([^*]+)\*\*/g, '<span class="strong">$1</span>')
    .replace(/ⁿᵉʷ/g, '<span class="new"></span>')
}

const BotName = (() => {
  if (/^karin/i.test(Plugin_Name)) {
    return 'Karin'
  } else if (packageJson.name === 'yunzai-next') {
    fs.rmdirSync(Plugin_Path, { recursive: true })
    return 'yunzai'
  } else if (Array.isArray(global.Bot?.uin)) {
    return 'TRSS-Yunzai'
  } else if (packageJson.dependencies.sequelize) {
    return 'Miao-Yunzai'
  } else {
    throw new Error('还有人玩Yunzai-Bot??')
  }
})()

const CHANGELOG_path = `${Plugin_Path}/CHANGELOG.md`

try {
  if (fs.existsSync(CHANGELOG_path)) {
    const logs = fs.readFileSync(CHANGELOG_path, 'utf8') || ''
    const lines = logs.replace(/\t/g, '   ').split('\n')
    let temp = {}
    let lastLine = {}

    _.forEach(lines, (line) => {
      if (changelogs.length >= versionCount) return true

      const versionMatch = /^#\s*([0-9a-zA-Z\\.~\s]+?)\s*$/.exec(line.trim())
      if (versionMatch && versionMatch[1]) {
        const v = versionMatch[1].trim()
        if (!currentVersion) {
          currentVersion = v
        } else if (temp.version) {
          changelogs.push(temp)
        }
        temp = { version: v, logs: [] }
      } else if (/^\s*[\\*\\-]/.test(line)) {
        lastLine = { title: getLine(line), logs: [] }
        temp.logs.push(lastLine)
      } else if (/^\s{2,}[\\*\\-]/.test(line)) {
        lastLine.logs.push(getLine(line))
      }
    })

    if (!_.isEmpty(temp) && changelogs.length < versionCount) {
      changelogs.push(temp)
    }
  }
} catch (err) {
}

const Version = {
  get ver () {
    return currentVersion
  },
  get name () {
    return BotName
  },
  get bot () {
    return Data.readJSON('package.json', `${Path}`).version
  },
  get logs () {
    return changelogs
  },
  get Path () {
    return Path
  },
  get Plugin_Name () {
    return Plugin_Name
  },
  get Plugin_Path () {
    return Plugin_Path
  }
}

export default Version
