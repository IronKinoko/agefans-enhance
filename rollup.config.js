import image from '@rollup/plugin-image'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import Copy from 'rollup-plugin-copy'
import styles from 'rollup-plugin-styles'
import pkg from './package.json'
import { genUserScriptInfo } from './template/userscript'
import esbuild from 'rollup-plugin-esbuild'

const globals = {
  'hls.js': 'Hls',
  plyr: 'Plyr',
  '@ironkinoko/danmaku': 'Danmaku',
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
    esbuild({
      target: 'es2017',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.APP_VERSION': JSON.stringify(pkg.version),
      },
    }),
    image(),
    styles(),
    nodeResolve({ browser: true, extensions: ['.js', '.ts'] }),
    !isDev &&
      Copy({
        targets: [
          { src: ['README.md', 'package.json', 'LICENSE'], dest: 'dist' },
        ],
      }),
  ].filter(Boolean),
})
