export function parseToJSON<T = any>(raw: string) {
  return new Promise<T>((resolve, reject) => {
    const blob = new Blob([raw], { type: 'application/json' })

    const url = URL.createObjectURL(blob)
    fetch(url)
      .then((r) => r.json())
      .then(resolve)
      .catch(reject)
      .finally(() => {
        URL.revokeObjectURL(url)
      })
  })
}
