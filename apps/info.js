import { Meme, Utils, Args } from "../models/index.js"

export class meme extends plugin {
  constructor () {
    super({
      name: "清语表情:表情包详情",
      event: "message",
      priority: -20,
      rule: [
        {
          reg: /^#?(清语表情|clarity-meme)\s*(\S+)\s*详情$/i,
          fnc: "info"
        }
      ]
    })
  }

  async info (e) {
    const message = (e?.msg || "").trim()
    const match = message.match(
      /^#?(清语表情|clarity-meme)\s*(\S+)\s*详情$/i
    )
    if (!match) return

    const keyword = match[2]

    Meme.load()

    const MemeData = Meme.infoMap
    const memeKey = MemeData[keyword]
      ? keyword
      : Object.keys(MemeData).find(key => MemeData[key].keywords.includes(keyword))

    if (!memeKey) {
      await e.reply("未找到相关表情包详情")
      return true
    }

    const memeDetails = MemeData[memeKey]
    const {
      min_texts = 0,
      max_texts = 0,
      min_images = 0,
      max_images = 0,
      default_texts = [],
      args_type = null
    } = memeDetails.params_type || {}

    let argsHint = ""
    if (args_type && Args.descriptions[memeKey]) {
      argsHint = Args.descriptions[memeKey]
    }

    const aliases = memeDetails.keywords ? memeDetails.keywords.join(", ") : "无"

    const previewUrl = Meme.getPreviewUrl(memeKey)
    let base64Data = ""
    let previewImageBase64 = ""

    try {
      const imageBuffer = await Utils.getImageBuffer(previewUrl)
      base64Data = await Utils.bufferToBase64(imageBuffer)
      previewImageBase64 = `base64://${base64Data}`
    } catch (error) {
      previewImageBase64 = "预览图片加载失败"
    }

    const replyMessage = [
      `名称: ${memeKey}\n`,
      `别名: ${aliases || "无"}\n`,
      `最大图片数量: ${max_images}\n`,
      `最小图片数量: ${min_images}\n`,
      `最大文本数量: ${max_texts}\n`,
      `最小文本数量: ${min_texts}\n`,
      `默认文本: ${default_texts.length > 0 ? default_texts.join(", ") : "无"}\n`
    ]

    if (argsHint) {
      replyMessage.push(`\n参数提示:\n${argsHint}`)
    }

    if (base64Data) {
      replyMessage.push("预览图片:\n")
      replyMessage.push(segment.image(previewImageBase64))
    } else {
      replyMessage.push("预览图片:\n")
      replyMessage.push(previewImageBase64)
    }

    await e.reply(replyMessage, true)
  }
}
