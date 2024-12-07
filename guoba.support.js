 
import { Config, Version } from './components/index.js'

// 兼容锅巴
export function supportGuoba () {
  return {
    // 插件信息，将会显示在前端页面
    // 如果你的插件没有在插件库里，那么需要填上补充信息
    // 如果存在的话，那么填不填就无所谓了，填了就以你的信息为准
    pluginInfo: {
      name: `${Version.Plugin_Name}`,
      title: '清语表情插件',
      author: '@shiwuliya',
      authorLink: 'https://github.com/shiwuliya',
      link: `https://github.com/wuliya336/${Version.Plugin_Name}`,
      isV3: true,
      isV2: false,
      showInMenu: 'auto',
      description: '一个Yunzai-Bot V3的扩展插件, 提供表情包合成功能',
      // 显示图标，此为个性化配置
      // 图标可在 https://icon-sets.iconify.design 这里进行搜索
      icon: 'mdi:wallet-membership',
      // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
      iconColor: 'rgb(188, 202, 224)'
      // 如果想要显示成图片，也可以填写图标路径（绝对路径）
      // iconPath: `${Version.Plugin_Path}/resources/logo.png`
    },
    // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [
        {
          component: 'Divider',
          label: '表情设置'
        },
        {
          field: 'meme.url',
          label: '自定义地址',
          component: 'Input',
          bottomHelpMessage: '自定义表情包地址,为空时使用自带',
        },
        {
          field: 'meme.cache',
          label: '缓存',
          component: 'Switch',
          bottomHelpMessage: '是否开启头像缓存'
        },
        {
          field: 'meme.reply',
          label: '引用回复',
          component: 'Switch',
          bottomHelpMessage: '是否开启引用回复'
        },
        {
          field: 'meme.defaultText',
          label: '默认文本方案',
          component: 'Select',
          componentProps: {
            options: [
              {
                label: '插件自带',
                value: 0
              },
              {
                label: '用户昵称',
                value: 1
              }
            ]
         },
        },
        {
          field: 'meme.forceSharp',
          label: '强制触发',
          component: 'Switch',
          bottomHelpMessage: '是否强制使用#触发, 开启后必须使用#触发'
        },
        {
          component: 'Divider',
          label: '其他设置'
        },
        {
          field: 'other.renderScale',
          label: '渲染精度',
          component: 'InputNumber',
          bottomHelpMessage:
            '可选值50~200，建议100。设置高精度会提高图片的精细度，但因图片较大可能会影响渲染与发送速度',
          required: true,
          componentProps: {
            min: 50,
            max: 200,
            placeholder: '请输入渲染精度'
          }
        }
      ],
      getConfigData () {
        return {
          meme: Config.meme,
          other: Config.other
        }
      },

      setConfigData (data, { Result }) {
        for (let key in data) {
          Config.modify(...key.split('.'), data[key])
        }
        return Result.ok({}, '保存成功辣ε(*´･ω･)з')
      }
    }
  }
}
