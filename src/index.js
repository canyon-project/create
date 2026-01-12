import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 默认模板仓库
const DEFAULT_TEMPLATE = 'travzhang/react-vite-template';

/**
 * 解析 GitHub 仓库 URL
 * @param {string} repo - GitHub 仓库 URL 或 owner/repo 格式
 * @returns {object} { owner, repo }
 */
function parseRepo(repo) {
  if (!repo) {
    return { owner: 'travzhang', repo: 'react-vite-template' };
  }

  // 处理完整 URL
  if (repo.startsWith('http://') || repo.startsWith('https://')) {
    const match = repo.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }

  // 处理 owner/repo 格式
  if (repo.includes('/')) {
    const [owner, repoName] = repo.split('/');
    return { owner, repo: repoName };
  }

  throw new Error(`无效的仓库格式: ${repo}`);
}

/**
 * 从 GitHub 下载模板
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} targetDir - 目标目录
 * @param {boolean} force - 是否强制覆盖
 */
async function downloadTemplate(owner, repo, targetDir, force = false) {
  const repoUrl = `https://github.com/${owner}/${repo}.git`;
  const tempDir = path.join(process.cwd(), `.zt-temp-${Date.now()}`);

  const spinner = ora(`正在从 GitHub 下载模板 ${owner}/${repo}...`).start();

  try {
    // 检查目标目录是否存在
    if (await fs.pathExists(targetDir)) {
      if (!force) {
        spinner.fail();
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `目录 ${targetDir} 已存在，是否覆盖？`,
            default: false,
          },
        ]);

        if (!overwrite) {
          console.log(chalk.yellow('操作已取消'));
          process.exit(0);
        }
      }

      spinner.text = '正在删除现有目录...';
      await fs.remove(targetDir);
    }

    // 克隆仓库到临时目录
    spinner.text = '正在克隆仓库...';
    execSync(`git clone --depth 1 ${repoUrl} "${tempDir}"`, {
      stdio: 'pipe',
    });

    // 删除 .git 目录
    const gitDir = path.join(tempDir, '.git');
    if (await fs.pathExists(gitDir)) {
      await fs.remove(gitDir);
    }

    // 移动文件到目标目录
    spinner.text = '正在设置项目...';
    await fs.move(tempDir, targetDir);

    spinner.succeed(chalk.green(`模板已成功下载到 ${targetDir}`));
  } catch (error) {
    spinner.fail();
    console.error(chalk.red(`下载失败: ${error.message}`));
    
    // 清理临时目录
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir).catch(() => {});
    }
    
    throw error;
  }
}

/**
 * 初始化 Git 仓库
 * @param {string} targetDir - 目标目录
 */
async function initGit(targetDir) {
  const spinner = ora('正在初始化 Git 仓库...').start();
  
  try {
    process.chdir(targetDir);
    execSync('git init', { stdio: 'pipe' });
    spinner.succeed(chalk.green('Git 仓库初始化成功'));
  } catch (error) {
    spinner.fail();
    console.warn(chalk.yellow(`Git 初始化失败: ${error.message}`));
  }
}

/**
 * 创建项目
 * @param {string} template - 模板仓库
 * @param {string} projectName - 项目名称
 * @param {object} options - 选项
 */
export async function createProject(template, projectName, options = {}) {
  try {
    // 解析模板仓库
    const { owner, repo } = parseRepo(template || DEFAULT_TEMPLATE);

    // 获取项目名称
    let targetName = projectName;
    if (!targetName) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '请输入项目名称:',
          default: 'my-project',
          validate: (input) => {
            if (!input.trim()) {
              return '项目名称不能为空';
            }
            return true;
          },
        },
      ]);
      targetName = answer.projectName;
    }

    const targetDir = path.resolve(process.cwd(), targetName);

    // 下载模板
    await downloadTemplate(owner, repo, targetDir, options.force);

    // 初始化 Git
    await initGit(targetDir);

    // 显示成功信息
    console.log('\n' + chalk.green('✓ 项目创建成功！'));
    console.log(chalk.cyan(`\n下一步:`));
    console.log(`  cd ${targetName}`);
    console.log(`  npm install`);
    console.log(`  npm run dev\n`);
  } catch (error) {
    console.error(chalk.red(`\n错误: ${error.message}`));
    process.exit(1);
  }
}
