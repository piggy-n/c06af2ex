import { defineConfig } from 'umi';

export default defineConfig({
  fastRefresh: {},
  hash: true,
  nodeModulesTransform: {
    type: 'none',
  },
  publicPath: './',
  routes: [{ path: '/', component: '@/pages/index' }],
});
