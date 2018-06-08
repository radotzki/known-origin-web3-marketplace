import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as mutations from './mutation';
import _ from 'lodash';
import Web3 from 'web3';
import axios from 'axios';
import artistData from './artist-data';
import createLogger from 'vuex/dist/logger';
import {getNetIdString, getEtherscanAddress, isHighRes} from '../utils';
import truffleContract from 'truffle-contract';
import knownOriginDigitalAssetJson from '../../build/contracts/KnownOriginDigitalAsset.json';

const KnownOriginDigitalAsset = truffleContract(knownOriginDigitalAssetJson);

Vue.use(Vuex);

import purchase from './modules/purchase';
import highres from './modules/highres';
import contract from './modules/contract';

const store = new Vuex.Store({
  plugins: [createLogger()],
  modules: {
    purchase,
    highres,
    contract
  },
  state: {
    // connectivity
    account: null,
    currentNetwork: null,
    accountBalance: null,
    assetsPurchasedByAccount: [],

    KnownOriginDigitalAsset: null,
    web3: null,
    currentUsdPrice: null,
    etherscanBase: null,

    // non-contract data
    artists: artistData,
    assets: null,
    assetsByEditions: null,
    assetsByArtistCode: null,
    editionSummary: null,
  },
  getters: {
    assetsForEdition: (state) => (edition) => {
      return state.assets.filter((asset) => asset.edition === edition);
    },
    availableAssetsForEdition: (state, getters) => (edition) => {
      let editions = getters.assetsForEdition(edition);
      return _.filter(editions, {purchased: 0});
    },
    firstAssetForEdition: (state) => (edition) => {
      return _.head(state.assets.filter((asset) => asset.edition === edition));
    },
    findNextAssetToPurchase: (state, getters) => ({edition}) => {
      let editions = getters.assetsForEdition(edition);
      return _.chain(editions)
      // find cheapest next edition (some editions can have different prices)
        .orderBy(['priceInEtherSortable', 'editionNumber'])
        .filter({purchased: 0})
        .head()
        .value();
    },
    assetById: (state) => (tokenId) => {
      return _.find(state.assets, (asset) => asset.id.toString() === tokenId.toString());
    },
    findArtist: (state) => (artistCode) => {
      return _.find(state.artists, (artist) => artist.artistCode.toString() === artistCode);
    },
    liveArtists: (state) => {
      return state.artists.filter((a) => a.live);
    },
    lookupAssetsByArtistCode: (state) => (artistCode) => {
      return _.filter(state.assetsByEditions, (value, key) => key.startsWith(artistCode));
    },
    featuredAssetsByEdition: (state, getters) => () => {
      const featuredEditionCodes = [
        // Arktiv
        'AKPSTELLAR000DIG',

        // obxium
        'OBXDDF5000000DIG',

        // Lee Holland
        'LHDPRIESTESS0001',

        //Manolide
        'MNONEOPLA0001DIG',

        //Takahiro Okawa
        'TKOTAKACMNCOSDIG',

        // obxium
        'OBXDDF1000000DIG',

        // Stina
        'STJHPYFRIBIRDDIG',
        'STJSPGMRN0001DIG',
        'STJRUNRIOT001DIG',

        // Stan regats
        'STRGRASSROOTSDIG',
        'STRSOFTFACE01DIG',
        'STRTOOMNYNOONDIG',

        // Franky anguliur
        'FKAMARTIANBNGDIG',
        'FKAHYPDTHSTY0DIG',
        'FKABUNNYBAGS0DIG',

        // 89-A
        '89AKURUSHI001DIG',

        // Katie O'Rourke
        'KORMANCHESTERDIG',

        // Laura Hawkins
        'LHKBUZZ000001DIG'
      ];

      if (!state.assets) {
        return [];
      }

      let results = [];
      _.forEach(featuredEditionCodes, (edition) => {
        const nextInEditionToPurchase = getters.findNextAssetToPurchase({edition});
        if (nextInEditionToPurchase) {
          results.push(nextInEditionToPurchase);
        }
      });

      return results;
    },
    featuredAssetsByTokenId: (state) => () => {
      const featuredAssets = [
        45, // 89—A
        150, // Lee Holland
        136, // Aktiv
        30, //Jame O'Conel
        185, // Franky
        161, // obxium
        165, // Stina
        175, 187 // Stan regats
      ];
      const filtered = _.filter(state.assets, (asset) => {
        return featuredAssets.indexOf(asset.id) >= 0;
      });

      return _.orderBy(filtered, 'priceInEther', 'asc');
    },
    editionSummaryFilter: (state) => (showSold = false, priceFilter = 'asc', artistFilter = 'all') => {

      const soldOutEditions = (edition) => {
        return edition.totalSupply === edition.totalPurchased;
      };

      const availableEditions = (edition) => {
        return edition.totalSupply !== edition.totalPurchased;
      };

      const artistCodeFilter = (edition) => {
        if (artistFilter === 'all') {
          return true;
        }
        return edition.artistCode === artistFilter;
      };

      const filtered = state.editionSummary
        .filter(showSold ? soldOutEditions : availableEditions)
        .filter(artistCodeFilter);

      return _.orderBy(filtered, 'priceInEther', priceFilter);
    },
    assetFilter: (state) => (showSold = false, priceFilter = 'asc', artistFilter = 'all') => {

      const purchasedAssets = (asset) => {
        return asset.purchased === 1 || asset.purchased === 2;
      };

      const showAllAssets = () => true;

      const artistCodeFilter = (asset) => {
        if (artistFilter === 'all') {
          return true;
        }
        return asset.artistCode === artistFilter;
      };

      const filtered = state.assets
        .filter(showSold ? purchasedAssets : showAllAssets)
        .filter(artistCodeFilter);

      return _.orderBy(filtered, 'priceInEther', priceFilter);
    },
    totalEditions: (state, getters) => () => {
      return _.size(_.uniqBy(state.assets, 'edition'));
    },
    totalListedArtists: (state, getters) => () => {
      return _.size(_.uniqBy(state.assets, 'artistCode'));
    },
    mostExpensivePiece: (state, getters) => () => {
      return _.head(_.orderBy(state.assets, 'priceInEtherSortable', 'desc'));
    },
    cheapestPiece: (state, getters) => () => {
      return _.head(_.orderBy(state.assets, 'priceInEtherSortable', 'asc'));
    },

  },
  mutations: {
    [mutations.SET_ASSETS](state, {assets, assetsByEditions, assetsByArtistCode, editionSummary}) {
      Vue.set(state, 'assets', assets);
      Vue.set(state, 'assetsByEditions', assetsByEditions);
      Vue.set(state, 'assetsByArtistCode', assetsByArtistCode);
      Vue.set(state, 'editionSummary', editionSummary);
    },
    [mutations.SET_ARTISTS](state, {artists}) {
      state.artists = artists;
    },
    [mutations.SET_ASSETS_PURCHASED_FROM_ACCOUNT](state, tokens) {
      Vue.set(state, 'assetsPurchasedByAccount', tokens.map(val => val.toString()));
    },
    [mutations.SET_ACCOUNT](state, {account, accountBalance}) {
      state.account = account;
      state.accountBalance = accountBalance;
      store.dispatch(actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT);

      // Full story identification of account for tracking
      /* global FS:true */
      FS.identify(account, {
        accountBalance: accountBalance,
        currentNetwork: state.currentNetwork
      });
    },
    [mutations.SET_CURRENT_NETWORK](state, currentNetwork) {
      state.currentNetwork = currentNetwork;
    },
    [mutations.SET_USD_PRICE](state, currentUsdPrice) {
      state.currentUsdPrice = currentUsdPrice;
    },
    [mutations.SET_ETHERSCAN_NETWORK](state, etherscanBase) {
      state.etherscanBase = etherscanBase;
    },
    [mutations.SET_WEB3](state, web3) {
      state.web3 = web3;
    },
    [mutations.SET_KODA_CONTRACT](state, KnownOriginDigitalAsset) {
      state.KnownOriginDigitalAsset = KnownOriginDigitalAsset;
    },
  },
  actions: {
    [actions.GET_ASSETS_PURCHASED_FOR_ACCOUNT]({commit, dispatch, state}) {
      KnownOriginDigitalAsset.deployed()
        .then((contract) => {
          return contract.tokensOf(state.account)
            .then((tokens) => {
              commit(mutations.SET_ASSETS_PURCHASED_FROM_ACCOUNT, tokens);

              // Note: this must happen after committing the accounts balance
              dispatch(`purchase/${actions.UPDATE_PURCHASE_STATE_FOR_ACCOUNT}`);
            });
        })
        .catch((e) => {
          console.error(e);
          // TODO handle errors
        });
    },
    [actions.GET_CURRENT_NETWORK]({commit, dispatch, state}) {
      getNetIdString()
        .then((currentNetwork) => {
          commit(mutations.SET_CURRENT_NETWORK, currentNetwork);
        });
      getEtherscanAddress()
        .then((etherscanBase) => {
          commit(mutations.SET_ETHERSCAN_NETWORK, etherscanBase);
        });
    },
    [actions.GET_USD_PRICE]: function ({commit, dispatch, state}) {

      axios.get('https://api.coinmarketcap.com/v1/ticker/ethereum/?convert=USD')
        .then((response) => {
          let currentPriceInUSD = response.data[0].price_usd;
          commit(mutations.SET_USD_PRICE, currentPriceInUSD);
        }, (response) => {
          console.error(response);
        });
    },
    [actions.INIT_APP]({commit, dispatch, state}, web3) {

      dispatch(actions.GET_USD_PRICE);

      // NON-ASYNC action - set web3 provider on init
      KnownOriginDigitalAsset.setProvider(web3.currentProvider);

      //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
      if (typeof KnownOriginDigitalAsset.currentProvider.sendAsync !== "function") {
        KnownOriginDigitalAsset.currentProvider.sendAsync = function () {
          return KnownOriginDigitalAsset.currentProvider.send.apply(
            KnownOriginDigitalAsset.currentProvider, arguments
          );
        };
      }

      // Set the web3 instance
      commit(mutations.SET_WEB3, web3);
      commit(mutations.SET_KODA_CONTRACT, KnownOriginDigitalAsset);

      // Find current network
      dispatch(actions.GET_CURRENT_NETWORK);

      web3.eth.getAccounts()
        .then((accounts) => {

          let account = accounts[0];

          const setAccountAndBalance = (account) => {
            return web3.eth.getBalance(account)
              .then((balance) => {
                let accountBalance = Web3.utils.fromWei(balance);
                // store the account details
                commit(mutations.SET_ACCOUNT, {account, accountBalance});
              });
          };

          const refreshHandler = () => {
            web3.eth.getAccounts()
              .then((updatedAccounts) => {
                if (updatedAccounts[0] !== account) {
                  account = updatedAccounts[0];
                  return setAccountAndBalance(account);
                }
              });
          };

          // Every second check if the main account has changed
          setInterval(refreshHandler, 1000);

          // init the KODA contract
          dispatch(`contract/${actions.REFRESH_CONTRACT_DETAILS}`);

          if (account) {
            return setAccountAndBalance(account);
          }
        })
        .catch(function (error) {
          console.log('ERROR - account locked', error);
          // TODO handle locked metamask account
        });
    },
    [actions.GET_ALL_ASSETS]({commit, dispatch, state}) {

      const lookupIPFSData = (tokenUri) => {

        // Load root IPFS data
        return axios.get(`${tokenUri}`)
          .then((tokenMeta) => {

            let rootMeta = tokenMeta.data;

            // Load additional meta about asset from IPFS
            return axios.get(`${rootMeta.meta}`)
              .then((otherMeta) => {
                return {
                  tokenUri: tokenUri,
                  name: rootMeta.name,
                  description: rootMeta.description,
                  external_uri: _.get(rootMeta, 'external_uri', 'http://knownorigin.io'),
                  attributes: _.get(rootMeta, 'attributes'),
                  otherMeta: otherMeta.data,
                  lowResImg: rootMeta.image
                };
              });
          });
      };

      const mapAssetType = (rawType) => {
        switch (rawType) {
          case 'DIG':
          // ERROR - the following two types have been patched in live, this needs to stay
          case '001':
          case 'D01':
            return 'digital';
          case 'PHY':
            return 'physical';
          default:
            return rawType;
        }
      };

      const lookupAssetInfo = (contract, index) => {
        return Promise.all([
          contract.assetInfo(index),
          contract.editionInfo(index)
        ])
          .then((results) => {
            let assetInfo = results[0];
            let editionInfo = results[1];

            const rawEdition = editionInfo[1];
            const owner = assetInfo[1];

            // Handle burnt tokens by checking edition and owner are both blank
            if (rawEdition === "0x00000000000000000000000000000000" && owner === "0x0000000000000000000000000000000000000000") {
              return null; // return nulls for for so we can strip them out at the nxt stage
            }

            // should always be 16 chars long
            const edition = Web3.utils.toAscii(rawEdition);

            const tokenUri = editionInfo[3];

            // Populate all data - minus tokenURI data
            return {
              id: assetInfo[0].toNumber(),
              owner: owner.toString(),
              purchased: assetInfo[2].toNumber(),
              priceInWei: assetInfo[3].toString(),
              priceInEther: Web3.utils.fromWei(assetInfo[3].toString(10), 'ether').valueOf(),
              priceInEtherSortable: Web3.utils.fromWei(assetInfo[3].toString(10), 'ether'),
              auctionStartDate: assetInfo[4].toString(10),

              edition: edition,
              // Last 3 chars of edition are type
              type: mapAssetType(edition.substring(13, 16)),
              // First 3 chars of edition are artist code
              artistCode: edition.substring(0, 3),
              editionNumber: editionInfo[2].toNumber(),
              tokenUri: tokenUri
            };
          });
      };

      KnownOriginDigitalAsset.deployed()
        .then((contract) => {
          let supply = _.range(0, state.contract.tokenIdPointer);

          /**
           * Functions takes a list of assets and loads all the metadata associated with them, preventing duplicate tokenUris
           */
          const populateTokenUriData = (assets) => {

            // find unique tokenUri's as editions will share the same metadata
            let uniqueTokenUri = _.map(_.uniqBy(assets, 'tokenUri'), 'tokenUri');

            // Look up each unique tokenUri
            let tokenUriLookups = _.map(uniqueTokenUri, (tokenUri) => lookupIPFSData(tokenUri));

            return Promise.all(tokenUriLookups).then((results) => {

              // flatten out the array of loading IPFS data into a map keyed by {tokenUri:data}
              let dataByTokenUri = _.keyBy(results, 'tokenUri');

              // find and set metadata onto each asset
              return _.map(assets, (asset) => {

                // grab data by tokenUri
                let ipfsMeta = dataByTokenUri[asset.tokenUri];

                // set IPFS lookup back on object
                _.set(asset, 'artworkName', ipfsMeta.name);
                _.set(asset, 'description', ipfsMeta.description);
                _.set(asset, 'lowResImg', ipfsMeta.lowResImg);
                _.set(asset, 'external_uri', ipfsMeta.external_uri);
                _.set(asset, 'otherMeta', ipfsMeta.otherMeta);
                _.set(asset, 'highResAvailable', isHighRes({
                  attributes: ipfsMeta.attributes,
                  artistCode: asset.artistCode
                }));
                if (ipfsMeta.attributes) {
                  _.set(asset, 'attributes', ipfsMeta.attributes);
                }

                return asset;
              });
            });
          };

          /**
           * Functions takes a set of assets, maps to various models and set on the store
           */
          const bindAssetsToStore = (assets) => {

            let assetsByEditions = _.groupBy(assets, 'edition');
            let assetsByArtistCode = _.groupBy(assets, 'artistCode');

            // flatten out the editions so we can easily work with them on the gallery page
            let editionSummary = _.map(assetsByEditions, function (assets, editionKey) {

              let editionSummary = {
                edition: editionKey,
                totalSupply: assets.length,
                totalPurchased: assets.filter((asset) => asset.purchased === 1 || asset.purchased === 2).length
              };

              // Add the first asset to the flat list
              _.extend(editionSummary, assets[0]);

              // chop the ID to ensure its not an asset
              delete editionSummary.id;
              delete editionSummary.purchased;

              return editionSummary;
            });

            commit(mutations.SET_ASSETS, {
              assets: assets,
              assetsByEditions: assetsByEditions,
              assetsByArtistCode: assetsByArtistCode,
              editionSummary: editionSummary,
            });
          };

          return Promise.all(_.map(supply, (index) => lookupAssetInfo(contract, index)))
            .then((assets) => {
              // Strip out burnt tokens which will appear as nulls in the list
              return _.without(assets, null);
            })
            .then(populateTokenUriData)
            .then(bindAssetsToStore);
        });
    },
  }
});

export default store;
