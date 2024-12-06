import { Version, Init } from './components/index.js';
import { Meme } from './models/index.js'
import chalk from 'chalk';

const startTime = Date.now();
Meme.load();

let apps;

apps = await Init().catch(error =>
  logger.error(chalk.rgb(255, 0, 0).bold(`❌ 初始化失败: ${error}`))
);

export { apps };

const endTime = Date.now();
const loadTime = endTime - startTime;

let loadTimeColor;
if (loadTime < 500) {
  loadTimeColor = chalk.rgb(144, 238, 144).bold;
} else if (loadTime < 1000) {
  loadTimeColor = chalk.rgb(255, 215, 0).bold; 
} else {
  loadTimeColor = chalk.rgb(255, 0, 0).bold; 
}

logger.info(chalk.rgb(0, 255, 0).bold('========= 🌟🌟🌟 ========='));

logger.info(
  chalk.rgb(255, 215, 0).bold('✨ 清语表情插件 ') +
  chalk.bold.rgb(255, 165, 0).italic(Version.ver) +
  chalk.rgb(255, 215, 0).bold(' 载入成功 ^_^')
);

logger.info(
  loadTimeColor(`⏱️ 载入耗时：${loadTime} ms`)
);

logger.info(chalk.rgb(0, 255, 255).bold('💬 雾里的小窝: 272040396'));
logger.info(chalk.rgb(0, 255, 0).bold('========================='));
