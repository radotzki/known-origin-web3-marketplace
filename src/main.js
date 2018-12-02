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
import ToggleButton from 'vue-js-toggle-button';
import BootstrapVue from 'bootstrap-vue';
import Vue2Filters from 'vue2-filters';
import {VLazyImagePlugin} from "v-lazy-image";

// Add brands to fontawesome
import fontawesome from '@fortawesome/fontawesome';
import brands from '@fortawesome/fontawesome-free-brands';
import solid from '@fortawesome/fontawesome-free-solid';

fontawesome.library.add(brands, solid);

Vue.use(VLazyImagePlugin);
Vue.use(VModal);
Vue.use(AsyncComputed);
Vue.use(ToggleButton);
Vue.use(BootstrapVue);
Vue.use(require('vue-moment'));
Vue.use(Vue2Filters);

Vue.config.productionTip = false;

Vue.filter('toEth', function (value) {
  if (!value) return '';
  return Web3.utils.fromWei(value.toString(10), 'ether').valueOf();
});

Vue.filter('to4Dp', function (value) {
  if (!value) return '';
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
      template: '<App/>'
    });
  }
})();
