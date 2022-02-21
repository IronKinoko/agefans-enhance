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

const isDev = process.env.NODE_ENV === 'development'

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
    typescript({
      target: isDev ? 'ESNext' : 'ES2017',
    }),
    image(),
    styles(),
    nodeResolve({ browser: true, extensions: ['.js', '.ts'] }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.APP_VERSION': JSON.stringify(pkg.version),
      preventAssignment: true,
    }),
    !isDev &&
      Copy({
        targets: [
          { src: ['README.md', 'package.json', 'LICENSE'], dest: 'dist' },
        ],
      }),
  ].filter(Boolean),
})
