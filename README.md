# zt-cli

一个类似 `create-vite` 的 CLI 工具，用于从 GitHub 下载模板仓库创建新项目。

## 功能特性

- 🚀 从 GitHub 下载模板仓库
- 📦 自动初始化 Git 仓库
- 🎯 支持自定义模板仓库
- 💪 支持强制覆盖现有目录
- 🎨 友好的命令行交互界面

## 安装

```bash
npm install -g
```

或者使用 `npm link` 进行本地开发：

```bash
npm link
```

## 使用方法

### 基本用法

使用默认模板（travzhang/react-vite-template）：

```bash
zt my-project
```

### 指定模板仓库

```bash
zt owner/repo my-project
```

或者使用完整 URL：

```bash
zt https://github.com/owner/repo my-project
```

### 强制覆盖现有目录

```bash
zt my-project --force
```

### 查看帮助

```bash
zt --help
```

## 示例

```bash
# 使用默认模板创建项目
zt my-react-app

# 使用自定义模板
zt travzhang/react-vite-template my-app

# 使用完整 URL
zt https://github.com/travzhang/react-vite-template my-app

# 强制覆盖
zt my-app --force
```

## 开发

```bash
# 安装依赖
npm install

# 运行 CLI
npm start
```

## 许可证

MIT
