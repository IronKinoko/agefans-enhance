// http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4
// eslint-disable-next-line no-undef
const player = new KPlayer('#player')
player.on('next', (p) => {
  console.log(p)
  player.currentTime = 20
})

player.src = 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'

