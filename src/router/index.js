import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import rtm from '@/components/rtm'
import demo from '@/components/demo'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/1',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/2',
      name: 'rtm',
      component: rtm
    },
    {
      path: '/',
      name: 'demo',
      component: demo
    },
  ]
})
