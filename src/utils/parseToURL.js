export default function parseToURL(url, count = 0) {
  if (count > 4) throw new Error('url解析失败')
  try {
    url = new URL(url)
  } catch (error) {
    url = decodeURIComponent(url)
    url = parseToURL(url, ++count)
  }

  return url.toString()
}
