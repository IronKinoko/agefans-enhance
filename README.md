# agefans enhance

增强 agefans 等网站播放功能，实现自动换集、画中画、历史记录、断点续播、弹幕等功能

**请使用 <kbd>?</kbd> 键查看脚本信息与快捷键**

**请使用 <kbd>?</kbd> 键查看脚本信息与快捷键**

**请使用 <kbd>?</kbd> 键查看脚本信息与快捷键**

## 特性

替换播放器，实现以下功能

- 弹幕
- 画中画
- 自动换集
- 超多快捷键，支持自定义
- 调整播放器外边框，适配视频比例
- 记录播放位置，自动续播
- 可以按 <kbd>?</kbd> 键调出脚本信息窗口，查看**视频信息**与**快捷键**
- 按 <kbd>esc</kbd> 键可以更快的退出全屏/宽屏/弹窗
- 多站点适配，可搜索相同视频资源/种子

## 安装

可以通过 [Greasy Fork](https://greasyfork.org/scripts/424023) 或 [GitHub](https://github.com/IronKinoko/agefans-enhance/raw/gh-pages/index.user.js) 安装

## 权限声明

1. `GM_xmlhttpRequest`

   - 脚本会请求有限的网络权限。仅用于访问弹幕查询功能需要链接到的 **dandanplay.net** 第三方域名
   - 你可以从 **脚本编辑/设置/XHR 安全** 中管理网络权限

2. `GM_getValue`, `GM_setValue`

   - 脚本会使用本地存储功能，用于在不同页面间保存 **播放器配置** 与 **agefans 历史浏览记录**

3. `@include`

   - 脚本还匹配了 **agefans** 以外的一些链接，用于提供相同视频资源搜索功能

## 预览

![预览图片](https://raw.githubusercontent.com/IronKinoko/asset/master/agefans-enhance/preview.jpg)

## 待做事项

- 暂无，欢迎提交意见（[issue](https://github.com/IronKinoko/agefans-enhance/issues)）

## 网站适配列表

\* 标记为推荐的网站

- [\*agefans](http://www.age.tv/)
- [\*NT 动漫](http://www.ntdm9.com/)
- [acgnya](https://www.acgnya.com/)
- [bimiacg](https://www.bimiacg10.net/)
- [アニメ新番組](https://bangumi.online/)

## 注意事项

### agefans 防止打开`devtools`时自动跳转主页

为实现这个功能，会替换掉用户自己的登录状态。当然你可以之后再重新登录自己的账号

在首页打开控制台，输入下面这段代码

```javascript
document.cookie = 'username=admin; path=/;max-age=9000000'
```

## 常见问题

### 1. 为什么我点击视频链接是直接打开了新页面，而不是下载？

因为`agefans`提供的链接都是第三方资源，浏览器的安全策略是禁止直接下载的。

所以请用右键**链接另存为**下载资源。

### 2. 为什么部分视频资源加载失败了？

目前这种情况大多数是因为`agefans`本身提供的资源就有问题。可以尝试暂时关闭脚本，测试链接是否正常。

如果关闭脚本后能正常观看，欢迎提交 issue 给我。（按 <kbd>?</kbd> 键选择提交 issue）

## 特别鸣谢

[弹弹 play](https://www.dandanplay.com/) 提供弹幕服务
