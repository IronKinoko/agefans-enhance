const { execSync } = require('child_process')

const exec = (cmd) => execSync(cmd, { stdio: 'inherit' })

exec('rollup -c')
exec('cp package.json dist/package.json')
exec('cp README.md dist/README.md')
