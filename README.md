# Like Sync to Flomo 插件介绍

## 概述
在 Twitter/X、微博、即刻页面点赞后，自动提取当前帖子内容并通过你配置的 Flomo Webhook 同步为一条新 memo。无需切换应用，保持“从一张卡片开始，打造你的知识川流”的轻量记录方式。

## 功能特性
- 点赞即同步：监听点赞按钮点击，延迟 300ms 后发送内容至 Flomo
- 智能提取：抓取作者、正文、链接，并附加来源标签（如 `#Twitter`、`#微博`、`#即刻`）
- 可配置 Webhook：在选项页填入你的 Flomo 入站 Webhook 地址
- 同步反馈：页面右上角显示成功或失败提示
- 即刻去重：避免同一动态被重复同步
- 一键推广：选项页支持显示、复制你的 Flomo 邀请码与邀请文案；提供官网直达入口

## 支持站点
- Twitter/X：`https://x.com/*`、`https://twitter.com/*`
- 微博：`https://weibo.com/*`、`https://www.weibo.com/*`
- 即刻：`https://web.okjike.com/*`、`https://okjike.com/*`

## 安装步骤
1. 打开 Chrome，访问 `chrome://extensions`
2. 开启“开发者模式”
3. 点击“加载已解压的扩展程序”，选择目录 `同步/插件`
4. 加载成功后，打开扩展的“选项”页面进行配置

## 配置 Webhook
- 在选项页“配置 Flomo API”输入框填入 Flomo 入站 Webhook 地址（形如 `https://flomoapp.com/iwh/xxx/yyy/`）
- 点击“保存”，可使用“发送测试”确认配置有效
- 注意 Webhook 建议保留末尾 `/`，并确认地址有效

## 使用方法
- 在支持站点点击“赞/喜欢”按钮
- 页面右上角会显示同步状态提示（成功或失败）
- 同步成功后，可在 Flomo 中看到新的 memo（包含作者、正文、链接和来源标签）

## 选项页功能
- Flomo API 配置与测试（保存到浏览器同步存储）
- 邀请开通模块：
  - 邀请码高亮展示与一键复制
  - 可自定义邀请码，自动同步到邀请文案
  - 一键复制邀请文案
- 官网入口：一键打开 `https://flomoapp.com/`
- 公众号推广：显示“把自己产品化”，支持一键复制名称

## 权限与安全
- 权限：`storage`（存储用户配置），`host_permissions` 仅限 `https://flomoapp.com/*`
- 不采集、不上传其他隐私数据；仅将当前点赞内容发送到你配置的 Flomo Webhook

## 目录结构
```
插件/
├─ manifest.json          # 扩展声明（MV3）
├─ background.js          # 后台服务（读取存储并向 Flomo 发送内容）
├─ options.html / options.js  # 选项页（配置 Webhook、邀请码与文案、官网入口）
├─ content_twitter.js     # Twitter/X 内容脚本（点赞监听与内容提取）
├─ content_weibo.js       # 微博内容脚本（点赞监听与内容提取）
└─ content_jike.js        # 即刻内容脚本（点赞监听与内容提取、去重）
```

## 原理说明
- 内容脚本在目标站点监听点赞按钮：
  - Twitter/X：`内容脚本参考：插件/content_twitter.js`
  - 微博：`内容脚本参考：插件/content_weibo.js`
  - 即刻：`内容脚本参考：插件/content_jike.js`
- 提取作者、正文与链接，组装文本后通过 `chrome.runtime.sendMessage` 发给后台
- 后台读取 `chrome.storage.sync` 中的 Webhook，使用 `fetch` 发送 JSON `{ content }`
- 为兼容 Flomo 可能的 `3xx` 状态，成功标准为 `200 <= status < 400`

## 常见问题
- 页面提示“同步失败”，但 Flomo 已新增 memo：
  - 旧版判断仅限 `2xx`，已在后台改为 `200 <= status < 400`（参考：`插件/background.js:1`）
  - 刷新扩展或重新加载，使 Service Worker 生效
- 未显示成功提示：
  - 确认已在选项页保存 Webhook 地址；为空时后台会返回“未配置 Flomo API”
  - 站点 DOM 可能更新，若点赞监听失效，可按需更新选择器
- Webhook 地址格式：建议包含末尾 `/`，并确保域名为 `https://flomoapp.com/`

## 更新日志
- v1.0.0
  - 支持 Twitter/X、微博、即刻点赞同步
  - 选项页新增邀请码与邀请文案、官网入口、公众号复制
  - 后台兼容 `3xx` 成功状态，修复误报问题

---
如需调整来源标签、提取规则或增加更多站点，请提出你的需求，我将继续优化与扩展。