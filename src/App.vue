<template>
  <div>
    <modal name="no-web3-found" :clickToClose="true" :width="300">
      <div class="alert alert-light fade show" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close" @click="$modal.hide('no-web3-found')">
          <span aria-hidden="true">&times;</span>
        </button>

        <p class="pt-4 text-danger">
          <strong>You require a Web3 Ethereum enabled browser to buy KODA assets!</strong>
        </p>

        <p>
          On a chrome browser add <a href="https://metamask.io" target="_blank">metamask.io</a> or install a mobile wallet such as <a href="https://trustwalletapp.com" target="_blank">TrustWallet</a>
        </p>

        <div class="text-center">
          <a href='https://metamask.io' target="_blank" class="pr-4"><img src="../static/metamask-logo-eyes.png" style="height: 50px"/></a>
          <a href="https://trustwalletapp.com" target="_blank"><img src="/../static/trustwallet_logo.svg" style="height:50px"/></a>
        </div>
      </div>
    </modal>

    <header>
      <nav class="navbar navbar-expand-md navbar-light bg-white text-primary fixed-top floating-nav">
        <router-link :to="{ name: 'home' }" class="navbar-brand">
          KnownOrigin.io
        </router-link>

        <ul class="navbar-nav mr-auto">
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item d-none d-md-block">
            <router-link :to="{ name: 'gallery' }" class="nav-link">Gallery</router-link>
          </li>
          <li class="nav-item d-none d-md-block">
            <router-link :to="{ name: 'artists' }" class="nav-link">Artists</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'account' }" class="nav-link">Account
              <!--<span class="badge badge-primary" v-if="assetsPurchasedByAccount.length > 0">{{ assetsPurchasedByAccount.length }}</span>-->
            </router-link>
          </li>
        </ul>
      </nav>
      <network-warning-banner></network-warning-banner>
    </header>

    <main role="main" class="container-fluid">
      <router-view></router-view>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col-sm">
            <small class="slogan">BE ORIGINAL. BUY ORIGINAL.</small>
          </div>
          <div class="col-sm text-center">
            <small>
              <router-link :to="{ name: 'gallery' }">Gallery</router-link> &bull;
              <router-link :to="{ name: 'artists' }">Artists</router-link> &bull;
              <router-link :to="{ name: 'details' }">Contract</router-link> &bull;
              <router-link :to="{ name: 'assets' }">Assets</router-link>
            </small>
          </div>
          <div class="col-sm text-center">
            <a href="mailto:hello@knownorigin.io" target="_blank" class="pr-2" title="Mail">
              <font-awesome-icon :icon="['fas', 'envelope-square']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://twitter.com/knownorigin_io" target="_blank" title="Twitter">
              <font-awesome-icon :icon="['fab', 'twitter']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://t.me/knownorigin_io" target="_blank" class="pr-2" title="Telegram">
              <font-awesome-icon :icon="['fab', 'telegram-plane']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://medium.com/knownorigin" target="_blank" class="pr-2" title="Medium">
              <font-awesome-icon :icon="['fab', 'medium']" size="lg"></font-awesome-icon>
            </a>
            <small class="">
              <current-network></current-network>
            </small>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
  /* global web3:true */

  import Web3 from 'web3';
  import { mapGetters, mapState } from 'vuex';
  import * as actions from './store/actions';
  import * as mutations from './store/mutation';
  import CurrentNetwork from './components/ui-controls/CurrentNetwork';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import NetworkWarningBanner from './components/ui-controls/NetworkWarningBanner';

  export default {
    name: 'app',
    components: {
      NetworkWarningBanner,
      FontAwesomeIcon,
      CurrentNetwork
    },
    computed: {
      ...mapGetters([]),
      ...mapState(['assetsPurchasedByAccount']),
    },
    methods: {
      // handleScroll (event) {
      //   console.log(document.body.scrollTop);
      // }
    },
    mounted () {

      let bootStrappedWeb3;

      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof web3 !== 'undefined') {
        bootStrappedWeb3 = new Web3(web3.currentProvider);
      } else {
        console.log('No web3! You should consider trying MetaMask or an Ethereum browser');
        console.log('Falling back to using HTTP Provider');

        bootStrappedWeb3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/nbCbdzC6IG9CF6hmvAVQ'));
      }

      window.web3 = bootStrappedWeb3;

      // Bootstrap the full app
      this.$store.dispatch(actions.INIT_APP, bootStrappedWeb3);
    },
    // created () {
    //   window.addEventListener('scroll', this.handleScroll);
    // },
    // destroyed () {
    //   window.removeEventListener('scroll', this.handleScroll);
    // }
  };


</script>

<style lang="scss">

  @import url('https://fonts.googleapis.com/css?family=Poppins:400,500,700');

  $body-bg: #f2f5fb;
  $body-color: #545454;
  $primary: #132cc4;
  $secondary: #545454;

  $font-family-base: 'Poppins', 'Avenir', Helvetica, Arial, sans-serif;

  @import '../node_modules/bootstrap/scss/bootstrap.scss';
  @import '../node_modules/bootstrap-vue/dist/bootstrap-vue.css';

  /* Sticky footer styles
-------------------------------------------------- */
  html {
    position: relative;
    min-height: 100%;
  }

  body {
    margin-bottom: 60px;
    padding-top: 50px;
    padding-bottom: 20px;
  }

  h1 {
    margin-top: 30px;
  }

  [v-cloak] {
    display: none
  }

  .navbar-light .navbar-brand {
    font-weight: 500;
    font-style: normal;
    font-size: 28px;
    letter-spacing: .02em;
    line-height: 1em;
    text-transform: none;
    color: $primary;
  }

  .navbar-light .navbar-nav .nav-link {
    color: $primary;
  }

  .navbar-light .navbar-brand:hover, .navbar-light .navbar-brand:focus {
    color: $primary;
  }
  
  .floating-nav {
    box-shadow: 0px 1px 3px #999;
  }

  .full-banner {
    font-size: 2.75rem;
    background-image: url("../static/kodo_pattern.jpeg");
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    body {
      padding-bottom: 100px;
    }

    .footer {
      .col-sm {
        padding-bottom: 10px;
      }
    }

    .navbar-light .navbar-brand {
      font-weight: 500;
      font-style: normal;
      font-size: 18px;
      letter-spacing: .02em;
      line-height: 1em;
      text-transform: none;
      color: $primary;
    }

    h1 {
      font-size: 1.5rem;
    }
  }

  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    min-height: 60px;
    line-height: 25px;
    background-color: $primary;
  }

  body > .container {
    padding: 60px 60px 0;
  }

  .footer > .container {
    padding-right: 15px;
    padding-left: 15px;
    padding-top: 15px;
    color: #f2f5fb;

    .slogan {
      color: rgba(255, 255, 255, 0.5);
    }

    a {
      color: #f2f5fb;
      padding-left: 2px;
      padding-right: 2px;
    }
  }

  .btn-group-vertical > button {
    margin-bottom: 10px;
  }

  .badge {
    font-weight: normal !important;
  }

  .badge-nav {
    background-color: rgba(255, 255, 255, 0.5);
    color: $primary;
  }
</style>
