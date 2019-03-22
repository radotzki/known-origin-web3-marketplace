<template>
  <div>
    <modal name="no-web3-found" :clickToClose="true" :width="300">
      <div class="alert alert-light fade show" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"
                @click="$modal.hide('no-web3-found')">
          <span aria-hidden="true">&times;</span>
        </button>

        <p class="pt-4 text-danger">
          <strong>You require a Web3 Ethereum enabled browser to buy KODA assets!</strong>
        </p>

        <p>
          On a chrome browser add <a href="https://metamask.io" target="_blank">metamask.io</a> or install a mobile
          wallet such as <a href="https://trustwalletapp.com" target="_blank">TrustWallet</a>
        </p>

        <div class="text-center">
          <a href='https://metamask.io' target="_blank" class="pr-4">
            <img src="../static/metamask-logo-eyes.png" style="height: 50px"/>
          </a>
          <a href="https://trustwalletapp.com" target="_blank">
            <img src="../static/trustwallet_logo.svg" style="height:50px"/>
          </a>
        </div>
      </div>
    </modal>

    <header>
      <b-navbar toggleable="md" variant="light" class="fixed-top floating-nav">

        <b-navbar-brand href="/home" v-if="['home', 'gallery'].indexOf($route.name) > -1">
          KnownOrigin.io
        </b-navbar-brand>

        <b-navbar-brand v-if="['home', 'gallery'].indexOf($route.name) === -1">
          <a @click="goBack">
            <img src="../static/back_arrow.svg" class="back-arrow"/>
          </a>
        </b-navbar-brand>

        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-collapse is-nav id="nav_collapse">
          <b-navbar-nav class="ml-auto">

            <router-link :to="{ name: 'feed' }" class="nav-link">Feed</router-link>

            <router-link :to="{ name: 'gallery' }" class="nav-link">Gallery</router-link>

            <router-link :to="{ name: 'artists' }" class="nav-link">Artists</router-link>

            <router-link :to="{ name: 'activity' }" class="nav-link">Activity</router-link>

            <router-link :to="{ name: 'openOffers' }" class="nav-link">Offers</router-link>

            <router-link :to="{ name: 'account' }" class="nav-link mr-3">
              Account
              <span class="badge badge-primary" v-if="totalPurchases() > 0">{{ totalPurchases() }}</span>
            </router-link>


          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
      <network-warning-banner></network-warning-banner>
    </header>

    <main role="main" class="container-fluid">
      <router-view></router-view>
    </main>

    <vue-snotify></vue-snotify>

    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col d-none d-md-inline">
            <small class="slogan">BE ORIGINAL. BUY ORIGINAL.</small>
          </div>
          <div class="col-xs col-sm text-center mb-2">
            <small>
              <router-link :to="{ name: 'feed' }">Feed</router-link> &bull;
              <router-link :to="{ name: 'gallery' }">Gallery</router-link> &bull;
              <router-link :to="{ name: 'artists' }">Artists</router-link> &bull;
              <router-link :to="{ name: 'openOffers' }">Offers</router-link> &bull;
              <router-link :to="{ name: 'contracts' }">Platform</router-link> &bull;
              <router-link :to="{ name: 'activity' }">Activity</router-link>
            </small>
          </div>
          <div class="col-xs col-sm text-center">
            <a href="mailto:hello@knownorigin.io" target="_blank" class="p-2" title="Mail">
              <font-awesome-icon :icon="['fas', 'envelope-square']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://twitter.com/knownorigin_io" target="_blank" class="p-2" title="Twitter">
              <font-awesome-icon :icon="['fab', 'twitter']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://t.me/knownorigin_io" target="_blank" class="p-2" title="Telegram">
              <font-awesome-icon :icon="['fab', 'telegram-plane']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://medium.com/knownorigin" target="_blank" class="p-2" title="Medium">
              <font-awesome-icon :icon="['fab', 'medium']" size="lg"></font-awesome-icon>
            </a>
          </div>
        </div>
        <div class="row mt-2">
          <div class="col ml-5 mr-5">
            <!-- Begin Mailchimp Signup Form -->
            <div id="mc_embed_signup">
              <form
                action="https://knownorigin.us19.list-manage.com/subscribe/post?u=84b0312927af7712ac2e6dd5a&amp;id=ebee270c72"
                method="post" id="mc-embedded-subscribe-form"
                name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
                <div id="mc_embed_signup_scroll">
                  <input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL"
                         placeholder="Subscribe to The Origin Weekly" required>
                  <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
                  <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text"
                                                                                            name="b_84b0312927af7712ac2e6dd5a_ebee270c72"
                                                                                            tabindex="-1" value="">
                  </div>
                  <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe"
                                            class="button"></div>
                </div>
              </form>
            </div>
            <!--End mc_embed_signup-->
          </div>
        </div>
        <div class="row mt-2 mb-2">
          <div class="col text-center text-white small">
            Built by <a href="http://blockrocket.tech" target="_blank">BlockRocket.tech</a>
            using
            <font-awesome-icon :icon="['fab', 'ethereum']"></font-awesome-icon>
            & IPFS
          </div>
        </div>
        <div class="row mt-2 mb-2">
          <div class="col text-center text-white">
            <current-network class="small"></current-network>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
  /* global web3:true */

  import Web3 from 'web3';
  import {mapGetters, mapState} from 'vuex';
  import * as actions from './store/actions';
  import CurrentNetwork from './components/ui-controls/generic/CurrentNetwork';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import NetworkWarningBanner from './components/ui-controls/generic/NetworkWarningBanner';
  import * as vConsole from 'vconsole';

  export default {
    name: 'app',
    metaInfo: {
      title: 'A digital arts marketplace powered by Ethereum and IPFS',
      metaInfo: {
        meta: [
          {charset: 'utf-8'}
        ]
      }
    },
    components: {
      NetworkWarningBanner,
      FontAwesomeIcon,
      CurrentNetwork
    },
    computed: {
      ...mapGetters(['totalPurchases']),
      ...mapState([]),
    },
    methods: {
      goBack() {
        window.history.length > 1
          ? this.$router.go(-1)
          : this.$router.push('/');
      }
    },
    /*eslint brace-style: "off"*/
    mounted() {
      console.log("Attempting to bootstrap application");

      if (window.location.href.indexOf("__debug") > -1) {
        // eslint-disable-next-line new-cap,no-new
        new vConsole();
      }

      // Load USD value on start
      this.$store.dispatch(actions.GET_USD_PRICE);

      // Load Artist data at the earliest possibility
      this.$store.dispatch(actions.LOAD_ARTISTS);

      // const INFURA_MAINNET_HTTP_PROVIDER = 'https://mainnet.infura.io/v3/4396873c00c84479991e58a34a54ebd9';
      const INFURA_MAINNET_WEBSOCKET_PROVIDER = 'wss://mainnet.infura.io/ws/v3/4396873c00c84479991e58a34a54ebd9';

      /**
       * Checks if web3 connected
       */
      const checkWeb3Running = () => {
        console.log('Checking is web3 is connected');
        window.web3.eth.net.getId()
          .then((network) => {
            console.log(`Web appears to be connected, launching application - network [${network}]`);
            this.$store.dispatch(actions.INIT_APP, window.web3);
          })
          .catch((e) => {
            console.log('Error Looks like Web3 is not connected - falling back to infura', e);
            if (attempts <= 5) {
              connectToInfura();
            } else {
              console.log(`Exceeded re-connect attempts - this is bad!`);
            }
            throw e;
          });
      };

      let attempts = 0;

      /**
       * Connects to INFURA mainnet
       */
      const connectToInfura = () => {
        attempts++;
        console.log(`Attempting to connect to INFURA - attempt [${attempts}]`);
        // window.web3 = new Web3(new Web3.providers.HttpProvider(INFURA_MAINNET_HTTP_PROVIDER));
        window.web3 = new Web3(new Web3.providers.WebsocketProvider(INFURA_MAINNET_WEBSOCKET_PROVIDER));

        console.log('Checking is web3 is connected');
        window.web3.eth.net.isListening()
          .then(() => {
            console.log('Web appears to be connected, launching application');
            this.$store.dispatch(actions.INIT_APP, window.web3);
          })
          .catch((e) => {
            console.log(`Error Looks like Web3 is not connected - attempt [${attempts}]`, e);
            if (attempts <= 5) {
              connectToInfura();
            } else {
              console.log(`Exceeded re-connect attempts - this is bad!`);
            }
          });
      };


      /**
       * Modern Web3 Provider - window.ethereum
       */
      const triggerModernWeb3Access = () => {
        console.log('Enabling ethereum (modern)');

        // Bootstrap web3 via ethereum provider
        const web3js = new Web3(window.ethereum);

        // Request account access if needed
        ethereum
          .enable()
          .then((value) => {
            console.log('Bootstrapping web app - provider acknowledged', value);
            window.web3 = web3js;
            checkWeb3Running();
          })
          .catch((error) => {
            console.log('User denied access, bootstrapping application using Infura', error);
            connectToInfura();
          });
      };

      let legacyAttempts = 0;

      /**
       * Legacy Web3 Provider - web3.currentProvider
       */
      const legacyWeb3Access = () => {
        legacyAttempts++;
        console.log(`Running legacy web3 provider - attempt [${legacyAttempts}]`);
        window.web3 = new Web3(web3.currentProvider);

        console.log('Checking is web3 is connected');
        window.web3.eth.net.getId()
          .then((network) => {
            console.log(`Web appears to be connected, launching application - network [${network}]`);
            this.$store.dispatch(actions.INIT_APP, window.web3);
          })
          .catch((e) => {
            console.log(`Error Looks like Web3 is not connected - attempt [${legacyAttempts}]`, e);
            if (attempts <= 3) {
              legacyWeb3Access();
            } else {
              console.log(`Exceeded re-connect attempts - this is bad!`);
            }
          });
      };

      ///////////////////////////////
      // START BOOTSTRAPPING LOGIC //
      ///////////////////////////////

      try {
        // Check for newer style ethereum provider
        if (window.ethereum) {
          console.log('window.ethereum', window.ethereum);
          triggerModernWeb3Access();
        }
        // Check for legacy web3
        else if (typeof web3 !== 'undefined') {
          console.log('web3', web3);
          legacyWeb3Access();
        }
        // Fallback to Infura
        else {
          console.log('Running without a web3 provider - falling back to Infura');
          connectToInfura();
        }

      } catch (e) {
        console.log('Something really bad happened - attempting once again to go via Infura', e);
        connectToInfura();
      }

      ///////////////////////////////
      // END BOOTSTRAPPING LOGIC //
      ///////////////////////////////

    }
  };


</script>

<style lang="scss">

  @import url('https://fonts.googleapis.com/css?family=Poppins:400,500,700');
  @import './ko-colours.scss';
  @import '../node_modules/bootstrap/scss/bootstrap.scss';
  @import '../node_modules/bootstrap-vue/dist/bootstrap-vue.css';

  /* Sticky footer styles
-------------------------------------------------- */
  html {
    position: relative;
    min-height: 100%;
  }

  body {
    margin-bottom: 180px;
    padding-top: 50px;
    padding-bottom: 15px;
  }

  h1 {
    margin-top: 30px;
  }

  main {
    min-height: 350px;
  }

  [v-cloak] {
    display: none
  }

  .navbar {
    padding: 10px;
    min-height: 60px;
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
    box-shadow: 0px 1px 1px #999;
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

  .container-fluid > .container {
    margin-top: 25px;
    margin-bottom: 25px;
  }

  .btn-group-vertical > button {
    margin-bottom: 10px;
  }

  .badge {
    font-weight: normal !important;
    border-radius: 0;
  }

  .badge-nav {
    background-color: rgba(255, 255, 255, 0.5);
    color: $primary;
  }

  .badge-extra-data {
    background-color: $primary-light;
    color: $white;
    padding: 6px;
    margin: 2px;

    a {
      color: $white;
      text-decoration: none;
      cursor: pointer;
    }
  }

  .back-arrow {
    cursor: pointer;
  }

  .card-desc {
    font-size: 0.75rem;
  }

  .artist-name {
    font-size: 0.8rem;
  }

  .artist-name-lg {
    font-size: 0.9rem;
  }

  .artist-link {
    color: $secondary;
  }

  .artist-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  .tag {
    font-size: 0.75rem;
    display: inline-block;
  }

  #mc_embed_signup {
    background: $primary;
    color: $body-bg;
    clear: left;
    font: 14px Helvetica, Arial, sans-serif;
    width: 100%;
  }

  .no-top-border {
    border-top: 0 none !important;
  }

  .full-banner-secondary {
    height: 50px;
    color: $body-bg;
  }

  /**************************************/
  /* vue-snotify notification overrides */
  /**************************************/

  .snotify {
    max-width: 370px !important;
  }

  $snotify-success: #F0F0F0;
  $snotify-success-bg: #2DD573;
  $snotify-success-color: #F0F0F0;

  $snotify-warning: #F0F0F0;
  $snotify-warning-bg: #F5A623;
  $snotify-warning-color: #F0F0F0;

  $snotify-info: #F0F0F0;
  $snotify-info-bg: #2D2935;
  $snotify-info-color: #F0F0F0;

  $snotify-simple: #2D2935;
  $snotify-simple-bg: #F0F0F0;
  $snotify-simple-color: #2D2935;

  @import "~vue-snotify/styles/material";

  .snotifyToast__body {
    width: 240px !important;
  }

  .notification-icon {
    width: 40px;
    float: left;
    font-size: 24px;
  }

  .notification-msg {
    padding-left: 30px;

    a {
      color: #F0F0F0;
      text-decoration: underline;
    }
  }

</style>
