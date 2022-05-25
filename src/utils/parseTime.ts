export function parseTime(time = 0) {
  time = Math.round(time)
  return `${Math.floor(time / 60)
    .toString()
    .padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`
}
