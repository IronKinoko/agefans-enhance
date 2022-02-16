export default function parseToURL(
  url: string | URL,
  count: number = 0
): string {
  if (count > 4) throw new Error('url解析失败 ' + url)
  try {
    url = new URL(url)
  } catch (error) {
    url = decodeURIComponent(url as string)
    url = parseToURL(url, ++count)
  }

  return url.toString()
}
