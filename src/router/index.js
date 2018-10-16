import Vue from 'vue';
import Router from 'vue-router';
import Artists from '@/components/pages/Artists';
import ContractDetails from '@/components/pages/ContractDetails';
import Account from '@/components/pages/Account';
import License from '@/components/pages/License';
import Gallery from '@/components/pages/Gallery';
import ArtistPage from '@/components/pages/ArtistPage';
import ConfirmPurchase from '@/components/pages/ConfirmPurchase';
import CompletePurchase from '@/components/pages/CompletePurchase';
import Activity from '@/components/pages/Activity';
import EditionTokenOverview from '@/components/pages/EditionTokenOverview';
import LegacyDeepLinkToken from '@/components/pages/legacy/LegacyDeepLinkToken';

import store from '../store';

Vue.use(Router);

export default new Router({
  mode: 'history',
  linkActiveClass: 'is-active',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return {x: 0, y: 0};
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Gallery
    },
    {
      path: '/contracts',
      name: 'contracts',
      component: ContractDetails
    },
    {
      path: '/account',
      name: 'account',
      component: Account
    },
    {
      path: '/terms',
      name: 'terms',
      component: License
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: Gallery
    },
    {
      path: '/artists',
      name: 'artists',
      component: Artists
    },
    {
      path: '/activity',
      name: 'activity',
      component: Activity
    },
    {
      path: '/token/:tokenId',
      name: 'edition-token',
      component: EditionTokenOverview,
      props: true
    },
    {
      path: '/edition/:editionNumber',
      name: 'confirmPurchaseSimple',
      component: ConfirmPurchase,
      props: true
    },
    {
      path: '/artists-v2/:artistAccount',
      name: 'artist-v2',
      component: ArtistPage,
      props: true
    },
    {
      path: '/artists-v2/:artistAccount/editions/:editionNumber',
      name: 'confirmPurchase',
      component: ConfirmPurchase,
      props: true
    },
    {
      path: '/artists-v2/:artistAccount/editions/:editionNumber/buy',
      name: 'completePurchase',
      component: CompletePurchase,
      props: true
    },
    {
      path: '/artists/:legacyArtistsCode',
      name: 'artists-legacy',
      beforeEnter: (to, from, next) => {
        const legacyArtistsCode = to.params.legacyArtistsCode;
        let artist = store.getters.findArtist(legacyArtistsCode);
        if (artist && artist.ethAddress) {
          next({
            name: 'artist-v2',
            params: {
              artistAccount: _.isArray(artist.ethAddress) ? artist.ethAddress[0] : artist.ethAddress
            }
          });
        } else {
          next({name: 'gallery'});
        }
      }
    },
    {
      path: '/assets/:legacyTokenId',
      name: 'legacy-asset',
      component: LegacyDeepLinkToken,
      props: true
    },
    // TODO missing legacy paths V1
    // '/artists/:legacyArtistCode/editions/:legacyEditionCode',
    // TODO missing V2 paths
    // /editions
    // /editions/:typeId
    // /editions/qr
    // -------------------------- //
  ]
});
