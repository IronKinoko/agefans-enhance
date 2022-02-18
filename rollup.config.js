import image from '@rollup/plugin-image'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { defineConfig } from 'rollup'
import Copy from 'rollup-plugin-copy'
import styles from 'rollup-plugin-styles'
import pkg from './package.json'
import { genUserScriptInfo } from './template/userscript'
import typescript from '@rollup/plugin-typescript'

const globals = {
  'hls.js': 'Hls',
  plyr: 'Plyr',
}

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    entryFileNames: 'index.user.js',
    format: 'iife',
    banner: genUserScriptInfo(pkg),
    globals,
  },
  external: Object.keys(globals),
  plugins: [
    typescript(),
    image(),
    styles(),
    nodeResolve({ browser: true, extensions: ['.js', '.ts'] }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.APP_VERSION': JSON.stringify(pkg.version),
      preventAssignment: true,
    }),
    process.env.NODE_ENV === 'production' &&
      Copy({
        targets: [
          { src: ['README.md', 'package.json', 'LICENSE'], dest: 'dist' },
        ],
      }),
  ].filter(Boolean),
})
