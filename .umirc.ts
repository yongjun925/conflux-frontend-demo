import { defineConfig } from 'umi';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

export default defineConfig({
  chainWebpack(memo) {
    memo.plugin('monaco-editor').use(MonacoWebpackPlugin, [
      {
        languages: ['json']
      }
    ])
  },
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/', component: '@/pages/index' }
      ]
    },
  ],
  fastRefresh: {},
  outputPath: 'docs',
  history: { type: 'hash' },
  publicPath: 'conflux-frontend-demo/'
});
