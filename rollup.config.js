import genUserScriptInfo from './src/userscirpt'
import pkg from './package.json'
import replace from '@rollup/plugin-replace'

/** @type {import('rollup').RollupOptions} */
const config = {
  input: 'src/index.js',
  output: {
    format: 'iife',
    file: 'index.user.js',
    banner: genUserScriptInfo(pkg),
    // globals: {
    //   jquery: '$'
    // }
  },
  // external: ['jquery']
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      preventAssignment: true,
    }),
  ],
}

export default config
