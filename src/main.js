// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import logging from './logging';
import VModal from 'vue-js-modal';
import Web3 from "web3";
import _ from 'lodash';

// This pollyfill is required for some browsers
import 'intersection-observer';

import AsyncComputed from 'vue-async-computed';
import BootstrapVue from 'bootstrap-vue';
import Vue2Filters from 'vue2-filters';
import VueLazyload from 'vue-lazyload';
import Snotify, {SnotifyPosition} from 'vue-snotify';
import VueAnalytics from 'vue-analytics';

// Add brands to fontawesome
import fontawesome from '@fortawesome/fontawesome';
import brands from '@fortawesome/fontawesome-free-brands';
import solid from '@fortawesome/fontawesome-free-solid';
import regular from '@fortawesome/fontawesome-free-regular';

fontawesome.library.add(brands, solid, regular);

Vue.use(VueLazyload, {
  // set observer to true
  observer: true,
  loading: '../static/300px_2.jpg',
  lazyComponent: true
});

Vue.use(Snotify, {
  toast: {
    position: SnotifyPosition.rightBottom,
    titleMaxLength: 150,
    bodyMaxLength: 300,
  },
});

Vue.use(VueAnalytics, {
  id: 'UA-117421198-1',
  router,
  autoTracking: {
    exception: true
  },
  batch: {
    enabled: true // default 2 every 500ms
  },
  debug: {
    // set to false to disable GA - locally NODE_ENV set to `development`
    sendHitTask: _.get(process.env, 'NODE_ENV', 'production') === 'production'
  }
});

Vue.use(VModal);
Vue.use(AsyncComputed);
Vue.use(BootstrapVue);
Vue.use(require('vue-moment'));
Vue.use(Vue2Filters);

Vue.config.productionTip = (process.env.NODE_ENV === 'production');
Vue.config.silent = false;

Vue.filter('toEth', function (value) {
  if (!value) return '';
  return Web3.utils.fromWei(value.toString(), 'ether').valueOf();
});

Vue.filter('to4Dp', function (value) {
  if (!value && value !== 0) return '';
  return parseFloat(value).toFixed(4);
});

Vue.filter('to3Dp', function (value) {
  if (!value) return '';
  return parseFloat(value).toFixed(3);
});

Vue.filter('to2Dp', function (value) {
  if (!value) return '';
  return parseFloat(value).toFixed(2);
});

Vue.filter('to0Dp', function (value) {
  if (!value) return '';
  return parseFloat(value).toFixed(0);
});

Vue.filter('humanize', function (value) {
  if (!value) return '';
  return _.startCase(value);
});

(async () => {
  try {
    // pre-Vue JS bootstrap
  } catch (e) {
    // eslint-disable-next-line
    console.log(e);
  } finally {
    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      store,
      router,
      logging,
      components: {App},
      template: '<App/>',
      beforeCreate() {
        Vue.$snotify = this.$snotify;
      },
    });
  }
})();
