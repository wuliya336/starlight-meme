export const cfgSchema = {
  meme: {
    title: '表情设置',
    cfg: {
      url: {
        title: '自定义地址',
        key: '自定义地址',
        desc: '设置表情包的地址，留空时使用自带',
        type: 'string',
        fileName: 'meme'
      },
      forceSharp: {
        title: '强制触发',
        key: '强制触发',
        def: false,
        desc: '是否强制使用#触发, 开启后必须使用#触发',
        type: 'boolean',
        fileName: 'meme'
      },
      cache: {
        title: '缓存',
        key: '缓存',
        def: true,
        desc: '是否开启头像缓存',
        type: 'boolean',
        fileName: 'meme'
      },
      reply: {
        title: '引用回复',
        key: '引用回复',
        def: false,
        desc: '是否开启引用回复',
        type: 'boolean',
        fileName: 'meme'
      },
      defaultText: {
        title: '默认文本方案',
        key: '默认文本方案',
        def: 0,
        desc: '设置默认文本方案: 0表示使用插件自带默认文本, 1表示使用用户昵称',
        type: 'number',
        fileName: 'meme',
        input: (n) => [0, 1].includes(n * 1) ? n * 1 : 0 
      }
    }
  },
  other: {
    title: '其他设置',
    cfg: {
      renderScale: {
        title: '渲染精度',
        key: '渲染精度',
        type: 'number',
        def: 100,
        input: (n) => Math.min(200, Math.max(50, n * 1 || 100)),
        desc: '可选值50~200，建议100。设置高精度会提高图片的精细度，但因图片较大可能会影响渲染与发送速度',
        fileName: 'other'
      }
    }
  }
}
