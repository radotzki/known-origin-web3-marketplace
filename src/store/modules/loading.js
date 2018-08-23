import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from 'web3';
import axios from 'axios';
import {isHighRes} from "../../utils";

const loadingStateModule = {
  namespaced: true,
  state: {
    pages: {}
  },
  getters: {
    isLoading: (state) => (page) => {
      return state.pages[page] === true;
    },
  },
  mutations: {
    [mutations.SET_LOADING_STARTED_STATE](state, page) {
      Vue.set(state, 'pages', {
        [page]: true
      });
    },
    [mutations.SET_LOADING_FINISHED_STATE](state, page) {
      Vue.set(state, 'pages', {
        [page]: false
      });
    },
  },
  actions: {
    [actions.LOADING_STARTED]: async function ({commit, dispatch, state, rootState}, page) {
      commit(mutations.SET_LOADING_STARTED_STATE, page);
    },
    [actions.LOADING_FINISHED]: async function ({commit, dispatch, state, rootState}, page) {
      commit(mutations.SET_LOADING_FINISHED_STATE, page);
    }
  }
};

export default loadingStateModule;
