# Like Sync to Flomo

## 概述
在 Twitter/X、微博、即刻、知乎、小红书 页面点赞后，自动提取当前内容并通过你配置的 Flomo Webhook 同步为一条新 memo。无需切换应用，保持“从一张卡片开始，打造你的知识川流”的轻量记录方式。

## 功能特性
- 点赞即同步：监听点赞/赞同事件，延迟 300ms 后将内容发送至 Flomo
- 智能提取：抓取作者、标题/正文、链接，并附加来源标签（`#Twitter`、`#微博`、`#即刻`、`#知乎`、`#小红书`）
- 可配置 Webhook：在选项页填入 Flomo 入站 Webhook 地址（需 Flomo Pro）
- 同步反馈：页面右上角显示成功或失败提示（`200–399` 视为成功）
- 即刻去重：避免同一动态被重复同步
- 便捷推广：选项页支持显示/复制邀请码与邀请文案，提供官网直达入口与公众号名称复制

## 支持站点
- Twitter/X：`https://x.com/*`、`https://twitter.com/*`
- 微博：`https://weibo.com/*`、`https://www.weibo.com/*`
- 即刻：`https://web.okjike.com/*`、`https://okjike.com/*`
- 知乎：`https://www.zhihu.com/*`
- 小红书：`https://www.xiaohongshu.com/*`

## 安装步骤
- 打开 Chrome/Edge，访问 `chrome://extensions` / `edge://extensions`
- 开启“开发者模式”
- 点击“加载已解压的扩展程序”，选择本项目目录 `like-flomo`
- 加载成功后，打开扩展的“选项”页进行配置

## 配置 Webhook
- 在选项页“配置 Flomo API（开通 pro 有效）”输入框填入 Flomo 入站 Webhook（形如 `https://flomoapp.com/iwh/xxx/yyy/`）
- 点击“保存”，可用“发送测试”确认配置有效
- 建议保留末尾 `/` 并确保域名为 `https://flomoapp.com/`

## 使用方法
- 在支持站点点击“赞/喜欢/赞同”按钮
- 页面右上角会显示同步状态提示（成功或失败）
- 同步成功后，可在 Flomo 中看到新的 memo（包含作者、标题/正文、链接及来源标签）

## 选项页功能
- Flomo API 配置与测试（保存到浏览器同步存储）
- 邀请开通模块：显示/复制邀请码；自动同步到邀请文案；一键复制邀请文案
- 官网入口：一键打开 `https://flomoapp.com/`
- 公众号推广：显示“把自己产品化”，一键复制公众号名称

## 权限与隐私
- 权限：`storage`（存储用户配置），`host_permissions` 仅限 `https://flomoapp.com/*`
- 不采集、不上传其他隐私数据；仅将当前点赞/赞同内容发送到你配置的 Flomo Webhook

## 目录结构
```
like-flomo/
├─ manifest.json              # 扩展声明（MV3）
├─ background.js              # 后台服务（读取存储并向 Flomo 发送内容）
├─ options.html / options.js  # 选项页（配置 Webhook、邀请码与文案、官网入口、公众号复制）
├─ content_twitter.js         # Twitter/X：点赞监听与内容提取
├─ content_weibo.js           # 微博：点赞监听与内容提取
├─ content_jike.js            # 即刻：点赞监听与内容提取、去重
├─ content_zhihu.js           # 知乎：赞同监听、标题/摘要提取与链接解析
└─ content_xhs.js             # 小红书：点赞监听、标题/摘要清理与链接拼接
```

## 原理说明
- 内容脚本在目标站点监听点赞/赞同按钮，提取作者、标题/正文与链接，拼接来源标签后通过 `chrome.runtime.sendMessage` 发给后台
- 后台读取 `chrome.storage.sync` 中的 Webhook（`flomoApi`），使用 `fetch` 发送 JSON `{ content }`
- 为兼容 Flomo 的跳转等响应，成功标准为 `200 <= status < 400`

## 常见问题
- 提示“同步失败”，但 Flomo 已新增 memo：
  - 旧版仅按 `2xx` 判断；现兼容 `200–399`，刷新扩展或重新加载使 Service Worker 生效
- 未显示成功提示：
  - 确认已在选项页保存 Webhook；未配置时后台会返回“未配置 Flomo API”
  - 站点 DOM 可能更新，若监听失效，请按需更新选择器
- Webhook 格式：建议包含末尾 `/`，域名为 `https://flomoapp.com/`
- Webhook 使用：需 Flomo Pro 开通入站 Webhook

## 更新
- 新增支持：知乎、小红书 点赞/赞同同步
- 选项页完善：邀请模块与公众号复制
- 后台：兼容 `3xx` 成功状态，减少误报

---
如需调整来源标签、提取规则或增加更多站点，请提出你的需求，我将继续优化与扩展。