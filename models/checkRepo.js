import { Version } from '../components/index.js'
import Tools from './tools.js'
import Request from './request.js'

const checkRepo = {
  /**
   * 获取 GitHub API 地址
   */
  async getGitApi () {
    const isAbroad = await Tools.isAbroad()
    return isAbroad ? 'https://api.github.com' : 'https://gh.llkk.cc/https://api.github.com'
  },

  /**
   * 获取本地仓库的地址并解析
   */
  async getRemoteRepo () {
    const localPath = Version.Plugin_Path

    try {
      const command = `git -C "${localPath}" config --get remote.origin.url`
      const remoteUrlRaw = await Bot.exec(command, { quiet: true })

      let remoteUrl = ''
      if (typeof remoteUrlRaw === 'object') {
        remoteUrl = remoteUrlRaw.stdout || JSON.stringify(remoteUrlRaw)
      } else {
        remoteUrl = String(remoteUrlRaw).trim()
      }

      const match = remoteUrl.match(/(?:https?:\/\/.+?\/)?(?:https?:\/\/)?github\.com[:\/]([^\/]+)\/([^\/]+?)(?:\.git)?$/)
      if (!match) {
        throw new Error(`无法解析远程仓库地址: ${remoteUrl}`)
      }

      const currentBranchCommand = `git -C "${localPath}" rev-parse --abbrev-ref HEAD`
      const currentBranchRaw = await Bot.exec(currentBranchCommand, { quiet: true })

      let currentBranch = ''
      if (typeof currentBranchRaw === 'object') {
        currentBranch = currentBranchRaw.stdout || JSON.stringify(currentBranchRaw)
      } else {
        currentBranch = String(currentBranchRaw).trim()
      }

      return { owner: match[1], repo: match[2], currentBranch }
    } catch (error) {
      throw new Error(`获取远程仓库地址或当前分支失败: ${error.message}`)
    }
  },

  /**
   * 格式化时间为中国时间
   */
  formatCommitTime (commitDate) {
    return new Date(commitDate).toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      hour12: false
    })
  },

  /**
   * 解析提交信息为标题和内容
   */
  parseCommitMessage (message) {
    const [title, ...contentLines] = message.split('\n\n')
    const content = contentLines.join('\n\n')
    return { title: title || '', content: content || '' }
  },

  /**
   * 获取指定分支的最近提交信息
   */
  async getLatestCommit (owner, repo, branch) {
    try {
      const apiBase = await this.getGitApi()
      const url = `${apiBase}/repos/${owner}/${repo}/commits/${branch}`
      const commit = await Request.get(url)

      const author = {
        login: commit.author?.login || '',
        avatar_url: commit.author?.avatar_url || ''
      }

      const committer = {
        login: commit.committer?.login || '',
        avatar_url: commit.committer?.avatar_url || ''
      }

      const { title, content } = this.parseCommitMessage(commit.commit.message)

      return {
        sha: commit.sha,
        author,
        committer,
        message: {
          title,
          content
        },
        commitTime: this.formatCommitTime(commit.commit.committer.date),
        commitUrl: commit.html_url
      }
    } catch (error) {
      throw new Error(`获取分支 ${branch} 的最近一次提交记录失败: ${error.message}`)
    }
  },

  /**
   * 检查更新，并返回最新的提交信息
   */
  async isUpToDate () {
    const localPath = Version.Plugin_Path

    try {
      const { owner, repo, currentBranch } = await this.getRemoteRepo()

      const localVersionCommand = `git -C "${localPath}" rev-parse HEAD`
      const localVersionRaw = await Bot.exec(localVersionCommand, { quiet: true })

      let localVersion = ''
      if (typeof localVersionRaw === 'object') {
        localVersion = localVersionRaw.stdout || JSON.stringify(localVersionRaw)
      } else {
        localVersion = String(localVersionRaw).trim()
      }

      const latestCommit = await this.getLatestCommit(owner, repo, currentBranch)

      const isUpToDate = localVersion === latestCommit.sha

      return {
        isUpToDate,
        localVersion,
        branchVersion: latestCommit.sha,
        branchName: currentBranch,
        latestCommit
      }
    } catch (error) {
      throw new Error(`版本检测失败: ${error.message}`)
    }
  }
}

export default checkRepo
