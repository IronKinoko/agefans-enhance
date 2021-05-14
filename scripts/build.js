const { execSync } = require('child_process')

const exec = (cmd) => execSync(cmd, { stdio: 'inherit' })

exec('rollup -c')
