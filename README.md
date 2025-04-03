# agefans enhance

增强网站播放功能，实现自动换集、画中画、历史记录、断点续播、弹幕等功能

## 网站适配列表

- [agefans](http://www.age.tv)
- [NT 动漫](https://www.ntdm8.com)
- [bimiacg](http://www.bimiacg10.net)
- [mutean](https://www.mutean.com)
- [次元城](https://www.cycani.org)
- [稀饭动漫](https://dick.xfani.com)
- [独立播放器](https://ironkinoko.github.io/agefans-enhance/)

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

## 特别鸣谢

[弹弹 play](https://www.dandanplay.com/) 提供弹幕服务
