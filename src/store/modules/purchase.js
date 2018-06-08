import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';

const purchaseStateModule = {
  namespaced: true,
  state: {
    purchaseState: {},
  },
  getters: {
    assetPurchaseState: (state) => (assetId) => {
      return _.get(state.purchaseState, assetId);
    },
    isPurchaseTriggered: (state, getters) => (assetId) => {
      return _.get(getters.assetPurchaseState(assetId), 'state') === mutations.PURCHASE_TRIGGERED;
    },
    isPurchaseStarted: (state, getters) => (assetId) => {
      return _.get(getters.assetPurchaseState(assetId), 'state') === mutations.PURCHASE_STARTED;
    },
    isPurchaseSuccessful: (state, getters) => (assetId) => {
      return _.get(getters.assetPurchaseState(assetId), 'state') === mutations.PURCHASE_SUCCESSFUL;
    },
    isPurchaseFailed: (state, getters) => (assetId) => {
      return _.get(getters.assetPurchaseState(assetId), 'state') === mutations.PURCHASE_FAILED;
    },
    getTransactionForAsset: (state, getters) => (assetId) => {
      return getters.assetPurchaseState(assetId).transaction;
    },
  },
  mutations: {
    [mutations.PURCHASE_TRIGGERED](state, {tokenId, buyer}) {
      state.purchaseState = {
        ...state.purchaseState,
        [tokenId]: {
          tokenId: tokenId.toString(10),
          buyer,
          state: 'PURCHASE_TRIGGERED'
        }
      };
    },
    [mutations.PURCHASE_FAILED](state, {tokenId, buyer}) {
      // Guard against the timed account check winner and the event coming through as failed
      if (state.purchaseState[tokenId] && state.purchaseState[tokenId].state === 'PURCHASE_SUCCESSFUL') {
        return;
      }
      state.purchaseState = {
        ...state.purchaseState,
        [tokenId]: {
          tokenId: tokenId.toString(10),
          buyer,
          state: 'PURCHASE_FAILED'
        }
      };
    },
    [mutations.PURCHASE_SUCCESSFUL](state, {tokenId, buyer}) {
      state.purchaseState = {
        ...state.purchaseState,
        [tokenId]: {
          tokenId: tokenId.toString(10),
          buyer,
          transaction: state.purchaseState[tokenId].transaction,
          state: 'PURCHASE_SUCCESSFUL'
        }
      };
    },
    [mutations.PURCHASE_STARTED](state, {tokenId, buyer, transaction}) {
      // Guard against the timed account check beating the event callbacks
      if (state.purchaseState[tokenId].state === 'PURCHASE_SUCCESSFUL') {
        state.purchaseState = {
          ...state.purchaseState,
          [tokenId]: {
            tokenId: tokenId.toString(),
            buyer,
            transaction,
            state: 'PURCHASE_SUCCESSFUL'
          }
        };
        return;
      }

      state.purchaseState = {
        ...state.purchaseState,
        [tokenId]: {
          tokenId: tokenId.toString(),
          buyer,
          transaction,
          state: 'PURCHASE_STARTED'
        }
      };
    },
    [mutations.RESET_PURCHASE_STATE](state, {tokenId}) {
      delete state.purchaseState[tokenId];
      state.purchaseState = {...state.purchaseState};
    },
  },
  actions: {
    [actions.PURCHASE_ASSET]: function ({commit, dispatch, state, rootState}, assetToPurchase) {
      Vue.$log.debug(`Attempting purchase of ${assetToPurchase.type} asset - ID ${assetToPurchase.id}`);

      rootState.KnownOriginDigitalAsset.deployed()
        .then((contract) => {

          let _buyer = rootState.account;
          let _tokenId = assetToPurchase.id;

          let purchaseEvent = contract.PurchasedWithEther({_tokenId: _tokenId, _buyer: _buyer}, {
            fromBlock: web3.eth.blockNumber,
            toBlock: 'latest' // wait until event comes through
          });

          // Trigger a timer to check the accounts purchases - can provide update faster waiting for the event
          const timer = setInterval(function () {
            console.log("Dispatching GET_ASSETS_PURCHASED_FOR_ACCOUNT");
            dispatch(actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT, null, {root: true});
          }, 1000);

          purchaseEvent.watch(function (error, result) {
            if (!error) {
              // 3) Purchase succeeded
              console.log('Purchase successful', result);
              dispatch(actions.REFRESH_CONTRACT_DETAILS, null, {root: true});
              dispatch(actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT, null, {root: true});
              commit(mutations.PURCHASE_SUCCESSFUL, {tokenId: _tokenId, buyer: _buyer});
            } else {
              console.log('Failure', error);
              // Purchase failure
              commit(mutations.PURCHASE_FAILED, {tokenId: _tokenId, buyer: _buyer});
              purchaseEvent.stopWatching();
            }
            if (timer) clearInterval(timer);
          });

          // 1) Initial purchase flow
          commit(mutations.PURCHASE_TRIGGERED, {tokenId: _tokenId, buyer: _buyer});

          let purchase = contract.purchaseWithEther(_tokenId, {
            from: _buyer,
            value: assetToPurchase.priceInWei
          });

          purchase
            .then((data) => {
              // 2) Purchase transaction submitted
              console.log('Purchase transaction submitted', data);
              commit(mutations.PURCHASE_STARTED, {tokenId: _tokenId, buyer: _buyer, transaction: data.tx});
            })
            .catch((error) => {
              // Purchase failure
              console.log('Purchase rejection/error', error);
              commit(mutations.PURCHASE_FAILED, {tokenId: _tokenId, buyer: _buyer});
              if (timer) clearInterval(timer);
            });
        })
        .catch((e) => {
          console.log('Failure', e);
          commit(mutations.PURCHASE_FAILED, {tokenId: assetToPurchase.id, buyer: rootState.account});
        });
    },
    [actions.PURCHASE_ASSET_WITH_FIAT]({commit, dispatch, state, rootState}, assetToPurchase) {

      let _buyer = rootState.account;
      let _tokenId = assetToPurchase.id;

      return rootState.KnownOriginDigitalAsset.deployed()
        .then((contract) => {

          let purchaseEvent = contract.PurchasedWithFiat({_tokenId: _tokenId}, {
            fromBlock: web3.eth.blockNumber,
            toBlock: 'latest' // wait until event comes through
          });

          purchaseEvent.watch(function (error, result) {
            if (!error) {
              // 3) Purchase succeeded
              dispatch(actions.REFRESH_CONTRACT_DETAILS, null, {root: true});
              dispatch(actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT, null, {root: true});
              commit(mutations.PURCHASE_SUCCESSFUL, {tokenId: _tokenId, buyer: _buyer});
            } else {
              // Purchase failure
              commit(mutations.PURCHASE_FAILED, {tokenId: _tokenId, buyer: _buyer});
              purchaseEvent.stopWatching();
              console.log('Failure', error);
            }
          });

          // 1) Initial purchase flow
          commit(mutations.PURCHASE_TRIGGERED, {tokenId: _tokenId, buyer: _buyer});

          let purchase = contract.purchaseWithFiat(_tokenId, {from: _buyer});

          purchase
            .then((data) => {
              // 2) Purchase transaction submitted
              console.log('Purchase transaction submitted', data);
              commit(mutations.PURCHASE_STARTED, {tokenId: _tokenId, buyer: _buyer, transaction: data.tx});
            })
            .catch((error) => {
              // Purchase failure
              console.log('Purchase rejection/error', error);
              commit(mutations.PURCHASE_FAILED, {tokenId: _tokenId, buyer: _buyer});
            });
        })
        .catch((e) => {
          console.log('Failure', e);
          commit(mutations.PURCHASE_FAILED, {tokenId: assetToPurchase.id, buyer: rootState.account});
        });
    },
    [actions.REVERSE_PURCHASE_ASSET_WITH_FIAT]({commit, dispatch, state, rootState}, assetToPurchase) {

      let _buyer = rootState.account;
      let _tokenId = assetToPurchase.id;

      return rootState.KnownOriginDigitalAsset.deployed()
        .then((contract) => {

          let purchaseEvent = contract.PurchasedWithFiatReversed({_tokenId: _tokenId}, {
            fromBlock: web3.eth.blockNumber,
            toBlock: 'latest' // wait until event comes through
          });

          purchaseEvent.watch(function (error, result) {
            if (!error) {
              // 3) Purchase succeeded
              dispatch(actions.REFRESH_CONTRACT_DETAILS, null, {root: true});
              dispatch(actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT, null, {root: true});
              commit(mutations.PURCHASE_SUCCESSFUL, {tokenId: _tokenId, buyer: _buyer});
            } else {
              // Purchase failure
              commit(mutations.PURCHASE_FAILED, {tokenId: _tokenId, buyer: _buyer});
              purchaseEvent.stopWatching();
              console.log('Failure', error);
            }
          });

          // 1) Initial purchase flow
          commit(mutations.PURCHASE_TRIGGERED, {tokenId: _tokenId, buyer: _buyer});

          let purchase = contract.reverseFiatPurchase(_tokenId, {from: _buyer});

          purchase
            .then((data) => {
              // 2) Purchase transaction submitted
              console.log('Purchase transaction submitted', data);
              commit(mutations.PURCHASE_STARTED, {tokenId: _tokenId, buyer: _buyer, transaction: data.tx});
            })
            .catch((error) => {
              // Purchase failure
              console.log('Purchase rejection/error', error);
              commit(mutations.PURCHASE_FAILED, {tokenId: _tokenId, buyer: _buyer});
            });
        })
        .catch((e) => {
          console.log('Failure', e);
          commit(mutations.PURCHASE_FAILED, {tokenId: assetToPurchase.id, buyer: rootState.account});
        });
    },
    [actions.UPDATE_PURCHASE_STATE_FOR_ACCOUNT]({commit, dispatch, state, rootState}) {

      // Get the tokens which are currently in the process of being purchased
      let currentAssetsBeingPurchased = _.keys(state.purchaseState);

      Vue.$log.debug(`Currently owned assets [${rootState.assetsPurchasedByAccount}] - accounts purchase state [${currentAssetsBeingPurchased}]`);

      // Match all which the assets which are current being purchased against the accounts balance from the blockchain
      let accountOwnedAssetsBeingPurchased = _.intersection(rootState.assetsPurchasedByAccount, currentAssetsBeingPurchased);

      if (accountOwnedAssetsBeingPurchased.length > 0) {

        _.forEach(accountOwnedAssetsBeingPurchased, function (asset) {
          // If the asset is not marked as PURCHASE_SUCCESSFUL force state to move to this
          if (state.purchaseState[asset].state !== 'PURCHASE_SUCCESSFUL') {
            Vue.$log.debug(`Purchase state for token [${asset}] is [${state.purchaseState[asset].state}] - updating state to [PURCHASE_SUCCESSFUL]`);
            commit(mutations.PURCHASE_SUCCESSFUL, {
              tokenId: asset,
              buyer: rootState.account,
              force: true // mark this as a force transaction for debugging
            });

            dispatch(actions.REFRESH_CONTRACT_DETAILS, null, {root: true}); // update state of asserts etc
          }
        });
      }
    },
    [actions.RESET_PURCHASE_STATE]: function ({commit, dispatch, state}, asset) {
      dispatch(`assets/${actions.GET_ALL_ASSETS}`, null, {root: true});
      commit(mutations.RESET_PURCHASE_STATE, {tokenId: asset.id});
    },
  },
};

export default purchaseStateModule;
