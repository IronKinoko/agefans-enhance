import { renderKey } from '../../../../utils/renderKey'
import { tabs } from '../../../../utils/tabs'
import { Shortcuts } from '../shortcuts'
import { normalizeKeyEvent } from '../utils'
import './index.scss'

function genIssueURL({ title, body }: { title: string; body: string }) {
  const url = new URL(
    `https://github.com/IronKinoko/agefans-enhance/issues/new`
  )
  url.searchParams.set('title', title)
  url.searchParams.set('body', body)
  return url.toString()
}

export const scriptInfo = (video: HTMLVideoElement | undefined) => {
  const githubIssueURL = genIssueURL({
    title: '🐛[Bug]',
    body: issueBody(video?.src),
  })

  return tabs([
    {
      name: '脚本信息',
      content: `
    <table>
      <tbody>
      <tr><td>脚本版本</td><td>${process.env.APP_VERSION}</td></tr>
      <tr>
        <td>脚本作者</td>
        <td><a target="_blank" rel="noreferrer" href="https://github.com/IronKinoko">IronKinoko</a></td>
      </tr>
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
      </tbody>
    </table>
    `,
    },
    {
      name: '快捷键',
      content: () => {
        const $root = $(`
        <div class="shortcuts">
          <table>
            <thead>
              <tr>
                <th>动作</th>
                <th>默认按键</th>
                <th>自定义</th>
              </tr>
            </thead>
            <colgroup>
              <col style="width:130px"></col>
              <col style="width:130px"></col>
              <col></col>
            </colgroup>
            <tbody></tbody>
          </table>
        </div>
        
        `)
        const keyBindings = Shortcuts.keyBindings.getKeyBindings()

        keyBindings.forEach((kb) => {
          const $tr = $(`
          <tr>
            <td>${kb.description}</td>
            <td>${renderKey(kb.originKey)}</td>
            <td>
              <input type="text" readonly ><a>删除</a>
            </td>
          </tr>
          `)

          if (kb.editable !== false) {
            $tr
              .find('input')
              .val(renderKey(kb.customKey))
              .get(0)
              ?.addEventListener('keydown', function (e) {
                e.stopPropagation()
                e.preventDefault()
                const key = normalizeKeyEvent(e)
                this.value = renderKey(key)
                Shortcuts.keyBindings.setKeyBinding(kb.command, key)
              })

            $tr.find('a').on('click', function (e) {
              $tr.find('input').val('')
              Shortcuts.keyBindings.setKeyBinding(kb.command, '')
            })
          } else {
            $tr.find('td').eq(2).html('不支持自定义')
          }

          $root.find('tbody').append($tr)
        })

        return $root
      },
    },
  ])
}

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
