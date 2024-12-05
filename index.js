import { Version, Init } from './components/index.js';
import { logger } from './components/Base/index.js';
import chalk from 'chalk';

const startTime = Date.now();

let apps;
if (Version.name !== 'Karin') {
  apps = await Init().catch(error =>
    logger.error(chalk.rgb(255, 0, 0).bold(`❌ 初始化失败: ${error}`))
  );
}

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

if (Version.name === 'Karin') {
  logger.info(
    chalk.rgb(0, 191, 255).bold('🎉 居然是 ') + 
    chalk.rgb(0, 255, 127).bold.underline('尊贵的Karin用户！')
  );
}

logger.info(
  chalk.rgb(255, 215, 0).bold('✨ 星点表情插件 ') +
  chalk.bold.rgb(255, 165, 0).italic(Version.ver) +
  chalk.rgb(255, 215, 0).bold(' 载入成功 ^_^')
);

logger.info(
  loadTimeColor(`⏱️ 载入耗时：${loadTime} ms`)
);

logger.info(chalk.rgb(0, 255, 255).bold('💬 雾里的小窝: 272040396'));
logger.info(chalk.rgb(0, 255, 0).bold('========================='));
