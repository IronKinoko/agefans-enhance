import { renderKey } from '../../../../utils/renderKey'
import './index.scss'

export const scriptInfo = (video: HTMLVideoElement, githubIssueURL: string) => `
<table class="script-info">
  <tbody>
  <tr><td>脚本版本</td><td>${process.env.APP_VERSION}</td></tr>
  <tr>
    <td>脚本源码</td>
    <td>
      <a target="_blank" rel="noreferrer" href="https://github.com/IronKinoko/agefans-enhance">GitHub</a>
      <a target="_blank" rel="noreferrer" href="https://github.com/IronKinoko/agefans-enhance/releases">更新记录</a>
      </td>
  </tr>
  <tr>
    <td>报错/意见</td>
    <td>
      <a target="_blank" rel="noreferrer" href="${githubIssueURL}">GitHub Issues</a>
      <a target="_blank" rel="noreferrer" href="https://greasyfork.org/scripts/424023/feedback">Greasy Fork 反馈</a>
    </td>
  </tr>
  ${
    video
      ? `<tr><td colspan="2" class="info-title">视频信息</td></tr>
     <tr><td>视频链接</td><td>${video.src}</td></tr>
     <tr><td>视频信息</td><td>${video.videoWidth} x ${video.videoHeight}</td></tr>`
      : ''
  }
  <tr><td colspan="2" class="info-title">快捷键</td></tr>
  <tr>
    <td colspan="2">
      <div class="shortcuts-wrap">
        <table class="shortcuts-table">
          <tbody>
            <tr><td><span class="key">W</span></td><td>宽屏</td></tr>
            <tr><td><span class="key">F</span></td><td>全屏</td></tr>
            <tr><td><span class="key">←</span></td><td>步退5s</td></tr>
            <tr><td><span class="key">→</span></td><td>步进5s</td></tr>
            <tr><td><span class="key">${renderKey(
              'Shift'
            )} ←</span></td><td>步退30s</td></tr>
            <tr><td><span class="key">${renderKey(
              'Shift'
            )} →</span></td><td>步进30s</td></tr>
            <tr><td><span class="key">${renderKey(
              'Alt'
            )} ←</span></td><td>步退60s</td></tr>
            <tr><td><span class="key">${renderKey(
              'Alt'
            )} →</span></td><td>步进60s</td></tr>
            <tr><td><span class="key">${renderKey(
              'Ctrl'
            )} ←</span></td><td>步退90s</td></tr>
            <tr><td><span class="key">${renderKey(
              'Ctrl'
            )} →</span></td><td>步进90s</td></tr>
            <tr><td><span class="key">D</span></td><td>弹幕开关</td></tr>
            </tbody>
        </table>
        <table class="shortcuts-table">
          <tbody>
            <tr><td><span class="key">esc</span></td><td>退出全屏/宽屏</td></tr>
            <tr>
              <td>
                <span class="key carousel">
                  <span>[</span>
                  <span>P</span>
                  <span>PgUp</span>
                </span>
              </td>
              <td>上一集</td>
            </tr>
            <tr>
              <td>
                <span class="key carousel">
                  <span>]</span>
                  <span>N</span>
                  <span>PgDn</span>
                </span>
              </td>
              <td>下一集</td>
            </tr>
            <tr><td><span class="key">Z</span></td><td>原速播放</td></tr>
            <tr><td><span class="key">X</span></td><td>减速播放</td></tr>
            <tr><td><span class="key">C</span></td><td>加速播放</td></tr>
            <tr><td><span class="key">↑</span></td><td>音量+</td></tr>
            <tr><td><span class="key">↓</span></td><td>音量-</td></tr>
            <tr><td><span class="key">M</span></td><td>静音</td></tr>
            <tr><td><span class="key">I</span></td><td>画中画</td></tr>
            <tr><td><span class="key">?</span></td><td>脚本信息</td></tr>
          </tbody>
        </table>
      </div>
    </td>
  </tr>
  </tbody>
</table>
`

export const issueBody = (src = '') => `# 文字描述
<!-- 如果有需要额外描述，或者提意见可以写在下面空白处 -->


# 网址链接
${window.location.href}

# 视频链接
${src}

# 环境
userAgent: ${navigator.userAgent}
脚本版本: ${process.env.APP_VERSION}
`
