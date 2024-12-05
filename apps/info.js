import { plugin } from "../components/Base/index.js"
import { Meme } from "../models/index.js"

export class meme extends plugin {
  constructor () {
    super({
      name: "星点表情:表情包详情",
      event: "message",
      priority: 100,
      rule: [
        {
          reg: /^#?(星点表情|starlight-meme)\s*(\S+)\s*详情$/i,
          fnc: "info"
        }
      ]
    })

    Meme.load()
  }

  /**
   * 处理详情命令
   */
  async info (e) {
    const message = (e?.msg || "").trim()
    const match = message.match(
      /^#?(星点表情|starlight-meme)\s*(\S+)\s*详情$/i
    )
    if (!match) return

    const keyword = match[2]
    const memeKey = Meme.getKey(keyword)
    const memeDetails = memeKey ? Meme.getInfo(memeKey) : null

    if (!memeKey || !memeDetails) {
      return true
    }

    await e.reply([
      `名称: ${memeKey}\n`,
      `别名: ${memeDetails.keywords[0] || "无"}\n`,
      `最大图片数量: ${memeDetails.params_type.max_images || 0}\n`,
      `最小图片数量: ${memeDetails.params_type.min_images || 0}\n`,
      `最大文本数量: ${memeDetails.params_type.max_texts || 0}\n`,
      `最小文本数量: ${memeDetails.params_type.min_texts || 0}`
    ])
  }
}
