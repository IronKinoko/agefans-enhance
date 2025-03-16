function readAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const fd = new FileReader()
    fd.onload = () => {
      resolve(fd.result as string)
    }
    fd.readAsText(file)
  })
}

async function parseSRTToVTT(file: File) {
  function srtToVtt(srtContent: string) {
    // 分割 SRT 文件的行
    const lines = srtContent.split('\n')
    let vttContent = 'WEBVTT\n\n'

    lines.forEach((line, index) => {
      // 忽略序号行
      if (!line.match(/^\d+$/)) {
        // 转换时间格式
        line = line.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
        vttContent += line + '\n'
      }
    })

    return vttContent
  }

  const srtContent = await readAsText(file)
  const vttContent = srtToVtt(srtContent)

  return new Blob([vttContent], { type: 'text/vtt' })
}

async function parseASSToVTT(file: File) {
  function assToVtt(assContent: string) {
    // 分割 ASS 文件的行
    const lines = assContent.split('\n')
    let vttContent = 'WEBVTT\n\n'
    let formatParts: string[] = []

    const eventStartIdx = lines.findIndex((line) => line.includes('[Events]'))
    const formatLine = lines
      .slice(eventStartIdx)
      .find((line) => line.startsWith('Format:'))

    if (!formatLine) throw new Error('ASS文件格式错误，未找到events.format')
    formatParts = formatLine
      .split(':')[1]
      .split(',')
      .map((part) => part.trim())

    // 处理每一行
    lines.forEach((line) => {
      // 只处理 Dialogue 行
      if (line.startsWith('Dialogue:')) {
        const parts = line.split(',')
        const formatMap: { [key: string]: string } = {}

        formatParts.forEach((part, index) => {
          formatMap[part] = parts[index].trim()
        })

        const timeStart = formatMap['Start']
        const timeEnd = formatMap['End']
        const text = formatMap['Text']

        // 转换时间格式
        const vttTimeStart = timeStart.replace(
          /(\d+):(\d+):(\d+).(\d+)/,
          (match, p1, p2, p3, p4) => {
            return `${p1.padStart(2, '0')}:${p2.padStart(2, '0')}:${p3.padStart(
              2,
              '0'
            )}.${p4.padEnd(3, '0')}`
          }
        )
        const vttTimeEnd = timeEnd.replace(
          /(\d+):(\d+):(\d+).(\d+)/,
          (match, p1, p2, p3, p4) => {
            return `${p1.padStart(2, '0')}:${p2.padStart(2, '0')}:${p3.padStart(
              2,
              '0'
            )}.${p4.padEnd(3, '0')}`
          }
        )
        vttContent += `${vttTimeStart} --> ${vttTimeEnd}\n${text}\n\n`
      }
    })

    return vttContent
  }

  const assContent = await readAsText(file)
  const vttContent = assToVtt(assContent)

  return new Blob([vttContent], { type: 'text/vtt' })
}

export function parseSubtitles(file: File) {
  if (file.name.match(/\.srt$/i)) {
    return parseSRTToVTT(file)
  }

  if (file.name.match(/\.vtt$/i)) {
    return file
  }

  if (file.name.match(/\.ass$/i)) {
    return parseASSToVTT(file)
  }

  throw new Error('不受支持的文件类型')
}
