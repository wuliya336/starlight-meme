import _ from "lodash"

const Args = {
  descriptions: {
    look_flat: "看扁率，数字.如#3",
    crawl: "爬的图片编号，1-92。如#33",
    firefly_holdsign: "流萤举牌的图片编号，1-21。如#2",
    symmetric: "方向，上下左右。如#下",
    dog_dislike: "是否圆形头像，输入圆即可。如#圆",
    petpet: "是否圆形头像，输入圆即可。如#圆",
    jiji_king: "是否圆形头像，输入圆即可。如#圆",
    kirby_hammer: "是否圆形头像，输入圆即可。如#圆",
    always: "一直图像的渲染模式，循环、套娃、默认。不填参数即默认。如一直#循环",
    gun: "方向，左、右、两边。如#两边",
    bubble_tea: "方向，左、右、两边。如#两边",
    clown: "是否使用爷爷头轮廓。如#爷",
    note_for_leave: "请假时间。如#2023年11月11日",
    mourning: "是否黑白。如#黑白 或 #灰",
    genshin_eat: "吃的角色(八重、胡桃、妮露、可莉、刻晴、钟离)。如#胡桃",
    clown_mask: "小丑在前或在后，如#前 #后",
    alipay: "二维码的内容链接或文本，如#https://github.com",
    wechat_pay: "二维码的内容链接或文本，如#https://github.com",
    panda_dragon_figure: "奇怪龙表情生成，如#原神龙",
    crawl: "今汐的图片编号，1-13。如#10"
  },

  handle (key, args) {
    if (!args) {
      args = ''
    }
    let argsObj = {}
    switch (key) {
      case 'look_flat': {
        argsObj = { ratio: parseInt(args || '2') }
        break
      }
      case 'crawl': {
        argsObj = { number: parseInt(args) ? parseInt(args) : _.random(1, 92, false) }
        break
      }
      case 'firefly_holdsign': {
        argsObj = { number: parseInt(args) ? parseInt(args) : _.random(1, 21, false) }
        break
      }
      case 'symmetric': {
        let directionMap = {
          左: 'left',
          右: 'right',
          上: 'top',
          下: 'bottom'
        }
        argsObj = { direction: directionMap[args.trim()] || 'left' }
        break
      }
      case 'petpet':
      case 'jiji_king':
      case 'kirby_hammer': {
        argsObj = { circle: args.startsWith('圆') }
        break
      }
      case 'my_friend': {
        argsObj = { name: args }
        break
      }
      case 'looklook': {
        argsObj = { mirror: args === '翻转' }
        break
      }
      case 'always': {
        let modeMap = {
          '': 'normal',
          循环: 'loop',
          套娃: 'circle'
        }
        argsObj = { mode: modeMap[args] || 'normal' }
        break
      }
      case 'gun':
      case 'bubble_tea': {
        let directionMap = {
          左: 'left',
          右: 'right',
          两边: 'both'
        }
        argsObj = { position: directionMap[args.trim()] || 'right' }
        break
      }
      case 'dog_dislike': {
        argsObj = { circle: args.startsWith('圆') }
        break
      }
      case 'clown': {
        argsObj = { person: args.startsWith('爷') }
        break
      }
      case 'note_for_leave': {
        if (args) {
          argsObj = { time: args }
        }
        break
      }
      case 'mourning': {
        argsObj = { black: args.startsWith('黑白') || args.startsWith('灰') }
        break
      }
      case 'genshin_eat': {
        const roleMap = {
          八重: 1,
          胡桃: 2,
          妮露: 3,
          可莉: 4,
          刻晴: 5,
          钟离: 6
        }
        argsObj = { character: roleMap[args.trim()] || 0 }
        break
      }
      case 'clown_mask': {
        argsObj = { mode: args === '前' ? 'front' : 'behind' }
        break
      }
      case "alipay": {
        argsObj = {
          message: args ? args : ""
        }
        break
      }
      case "wechat_pay": {
        argsObj = {
          message: args ? args : ""
        }
        break
      }
      case "panda_dragon_figure": {
        argsObj = {
          name: args || ""
        }
        break
      }
      case "jinhsi": {
        argsObj = { number: Math.min(parseInt(args || '1'), 13) }
        break
      }
    }
    return JSON.stringify(argsObj)
  }
}

export default Args
