import Vue from 'vue';
import Router from 'vue-router';
import Artists from '@/components/pages/Artists';
import ContractDetailsV2 from '@/components/pages/ContractDetailsV2';
import Gallery from '@/components/pages/Gallery';
import GalleryV2 from '@/components/pages/GalleryV2';
import Account from '@/components/pages/Account';
import License from '@/components/pages/License';
import Assets from '@/components/pages/Assets';
import ConfirmPurchase from '@/components/pages/ConfirmPurchase';
import ConfirmPurchaseQr from '@/components/pages/ConfirmPurchaseQr';
import ArtistPage from '@/components/pages/ArtistPage';
import CompletePurchase from '@/components/pages/CompletePurchase';
import AssetDetailView from '@/components/pages/AssetDetailView';

//////////////
// V2 Views //
//////////////

import GalleryKODAV2 from '@/components/pages/GalleryKODAV2';
import ArtistPageKODAV2 from '@/components/pages/ArtistPageKODAV2';
import ConfirmPurchaseKODAV2 from '@/components/pages/ConfirmPurchaseKODAV2';
import CompletePurchaseKODAV2 from '@/components/pages/CompletePurchaseKODAV2';

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
      component: GalleryV2
    },
    {
      path: '/contractDetails',
      name: 'details',
      component: ContractDetailsV2
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: GalleryV2
    },
    {
      path: '/editions',
      name: 'editions',
      component: Gallery
    },
    {
      path: '/account',
      name: 'account',
      component: Account
    },
    {
      path: '/license',
      name: 'license',
      component: License
    },
    {
      path: '/assets',
      name: 'assets',
      component: Assets
    },
    {
      path: '/assets/:tokenId',
      name: 'assetDetailView',
      component: AssetDetailView,
      props: true
    },
    {
      path: '/artists/:artistCode',
      name: 'artist',
      component: ArtistPage,
      props: true
    },
    {
      path: '/artists/:artistCode/editions/:edition',
      name: 'confirmPurchase',
      component: ConfirmPurchase,
      props: true
    },
    {
      path: '/artists/:artistCode/editions/:edition/qr',
      name: 'confirmPurchaseQr',
      component: ConfirmPurchaseQr,
      props: true
    },
    {
      path: '/editions/:edition',
      name: 'confirmPurchaseShort',
      component: ConfirmPurchase,
      props: true
    },
    {
      path: '/artists/:artistCode/editions/:edition/assets/:tokenId',
      name: 'completePurchase',
      component: CompletePurchase,
      props: true
    },
    ///////////////////////
    // V2 contract views //
    ///////////////////////
    {
      path: '/gallery-v2',
      name: 'galleryV2',
      component: GalleryKODAV2
    },
    {
      path: '/artists-v2/:artistAccount',
      name: 'artist-v2',
      component: ArtistPageKODAV2,
      props: true
    },
    {
      path: '/artists-v2/:artistAccount/editions/:editionNumber',
      name: 'confirmPurchaseV2',
      component: ConfirmPurchaseKODAV2,
      props: true
    },
    {
      path: '/artists-v2/:artistAccount/editions/:editionNumber/buy',
      name: 'completePurchaseV2',
      component: CompletePurchaseKODAV2,
      props: true
    },
    {
      path: '/artists',
      name: 'artists',
      component: Artists
    },
  ]
});
