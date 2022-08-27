import image from '@rollup/plugin-image'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import Copy from 'rollup-plugin-copy'
import styles from 'rollup-plugin-styles'
import pkg from './package.json'
import esbuild from 'rollup-plugin-esbuild'
import fs from 'fs'
import path from 'path'

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
    userscript(),
  ].filter(Boolean),
})

/**
 * @return {import('rollup').Plugin}
 */
function userscript() {
  const metaFilePath = path.resolve(__dirname, 'meta.template')

  return {
    name: 'userscript',
    buildStart() {
      this.addWatchFile(metaFilePath)
    },
    outputOptions(opts) {
      let meta = fs.readFileSync(metaFilePath, 'utf-8')
      for (const key in pkg) {
        if (Object.hasOwnProperty.call(pkg, key)) {
          const element = pkg[key]
          meta = meta.replace(`{{${key}}}`, element)
        }
      }
      opts.banner = meta
    },
  }
}
