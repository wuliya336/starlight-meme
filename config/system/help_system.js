export const helpCfg = {
  title: "星点表情帮助",
  subTitle: "starlight-meme",
  columnCount: 3,
  colWidth: 265,
  theme: "all",
  themeExclude: ["default"],
  style: {
    fontColor: "#d3bc8e",
    descColor: "#eee",
    contBgColor: "rgba(6, 21, 31, .5)",
    contBgBlur: 3,
    headerBgColor: "rgba(6, 21, 31, .4)",
    rowBgColor1: "rgba(6, 21, 31, .2)",
    rowBgColor2: "rgba(6, 21, 31, .35)",
  },
};

export const helpList = [
  {
    group: "[]内为必填项,{}内为可选项",
  },
  {
    group: "拓展命令",
    list: [
      {
        icon: 81,
        title: "#星点表情列表",
        desc: "获取表情列表",
      },
      {
        icon: 81,
        title: "#星点表情xx详情",
        desc: "获取表情详情",
      }
    ],
  },
  {
    group: "管理命令，仅主人可用",
    auth: "master",
    list: [
      {
        icon: 95,
        title: "#星点表情(插件)(强制)更新",
        desc: "更新插件本体",
      },
      {
        icon: 85,
        title: "#星点表情设置",
        desc: "管理命令",
      },
    ],
  },
];

export const isSys = true;
