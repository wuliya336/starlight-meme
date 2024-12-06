import { logger, plugin, segment } from '../components/Base/index.js'
import { Meme, Utils, Args } from "../models/index.js"

export class meme extends plugin {
  constructor () {
    super({
      name: "星点表情:表情包详情",
      event: "message",
      priority: -20,
      rule: [
        {
          reg: /^#?(星点表情|starlight-meme|表情)\s+(\S+)\s*详情$/i,
          fnc: "info"
        }
      ]
    })
  }

  async info (e) {
    try {

      const match = e.msg.match(/^#?(星点表情|starlight-meme|表情)\s+(\S+)\s*详情$/i)
      if (!match) {
        return false
      }

      const keyword = match[2]

      Meme.load()
      const MemeData = Meme.infoMap

      if (!MemeData || Object.keys(MemeData).length === 0) {
        await e.reply("表情包数据未加载，请稍后再试", true)
        return false
      }
      const memeKey = Object.keys(MemeData).find(key => {
        const info = MemeData[key]
        return key === keyword || info.keywords.includes(keyword)
      })

      if (!memeKey) {
        await e.reply(`未找到与 "${keyword}" 相关的表情包详情`, true)
        return false
      }

      const memeDetails = MemeData[memeKey]
      const params_type = memeDetails.params_type || {}
      const {
        min_texts = 0,
        max_texts = 0,
        min_images = 0,
        max_images = 0,
        default_texts = [],
        args_type = null
      } = params_type

      const argsHint = args_type && Args[args_type] ? Args[args_type] : ""
      const aliases = memeDetails.keywords.join(", ")

      const previewUrl = Meme.getPreviewUrl(memeKey)
      let previewImage = "图片加载失败"
      try {
        const imageBuffer = await Utils.getImageBuffer(previewUrl)
        const base64Data = await Utils.bufferToBase64(imageBuffer)
        previewImage = segment.image(`base64://${base64Data}`)
      } catch (error) {
        logger.error(`[星点表情] 图片加载失败: ${error.message}`)
      }

      const replyMessage = [
        `名称: ${memeKey}`,
        `别名: ${aliases || "无"}`,
        `可搜索键值: ${memeKey}, ${aliases || "无"}`,
        `最大图片数量: ${max_images}`,
        `最小图片数量: ${min_images}`,
        `最大文本数量: ${max_texts}`,
        `最小文本数量: ${min_texts}`,
        `默认文本: ${default_texts.length > 0 ? default_texts.join(", ") : "无"}`
      ]

      if (argsHint) {
        replyMessage.push("参数提示:\n" + argsHint)
      }

      replyMessage.push("预览图片:")
      replyMessage.push(previewImage)

      await e.reply(replyMessage.join("\n"), true)
    } catch (error) {
      logger.error(`[星点表情] 获取详情失败: ${error.message}`)
      await e.reply("获取表情包详情时发生错误，请稍后重试", true)
    }
  }
}
