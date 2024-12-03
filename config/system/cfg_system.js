export const cfgSchema = {
  meme: {
    title: '表情设置',
    cfg: {
      forceSharp: {
        title: '强制触发',
        key: '强制触发',
        def: false,
        desc: '是否强制使用#触发, 如#喜报',
        fileName: 'meme'
      },
      cache: {
        title: '缓存',
        key: '缓存',
        def: true,
        desc: '是否开启头像缓存',
        fileName: 'meme'
      },
      reply: {
        title: '引用回复',
        key: '引用回复',
        def: false,
        desc: '是否开启引用回复',
        fileName: 'meme'
      }
    }
  },
  other: {
    title: '其他设置',
    cfg: {
      renderScale: {
        title: '渲染精度',
        key: '渲染精度',
        type: 'num',
        def: 100,
        input: (n) => Math.min(200, Math.max(50, n * 1 || 100)),
        desc: '可选值50~200，建议100。设置高精度会提高图片的精细度，但因图片较大可能会影响渲染与发送速度',
        fileName: 'other'
      }
    }
  }
}
