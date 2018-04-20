<template>
  <div>

    <modal name="no-web3-found" :height="450" :width="350" :clickToClose="true">
      <div class="no-web3-found-container">
        <div>
          <h2 class="text-danger">No Ethereum Provider Detected!</h2>

          <p>
            You need to install <a href='https://metamask.io' target="_blank">MetaMask</a> to use this application and buy digital assets.
          </p>

          <div style="display: block; margin-left: auto; margin-right: auto; width: 50%;">
            <a href='https://metamask.io' target="_blank"><img src="../static/metamask-logo-eyes.png" style="width: 150px"/></a>
          </div>

          <p>
            Or install a Ethereum wallet such as <a href="https://trustwalletapp.com" target="_blank">TrustWallet</a>
          </p>

          <div>
            <a href="https://trustwalletapp.com" target="_blank"><img src="/../static/trustwallet_logo.svg" style="height:50px"/></a>
          </div>

        </div>
      </div>
    </modal>

    <header>
      <nav class="navbar navbar-expand-md navbar-dark bg-primary fixed-top">
        <router-link :to="{ name: 'home' }" class="navbar-brand">
          KnownOrigin.io
        </router-link>

        <ul class="navbar-nav justify-content-end">
          <li class="nav-item d-none d-sm-block">
            <router-link :to="{ name: 'gallery' }" class="nav-link">Gallery</router-link>
          </li>
          <li class="nav-item d-none d-sm-block">
            <router-link :to="{ name: 'artists' }" class="nav-link">Artists</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'account' }" class="nav-link">Account</router-link>
          </li>
        </ul>
      </nav>
    </header>

    <main role="main" class="container pb-4">
      <router-view></router-view>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col-sm">
            <small class="slogan">BE ORIGINAL. BUY ORIGINAL.</small>
          </div>
          <div class="col-sm">
            <small>
              <router-link :to="{ name: 'gallery' }">Gallery</router-link> &bull;
              <router-link :to="{ name: 'artists' }">Artists</router-link> &bull;
              <router-link :to="{ name: 'account' }">Account</router-link> &bull;
              <router-link :to="{ name: 'details' }">Contract</router-link> &bull;
              <router-link :to="{ name: 'license' }">License</router-link>
            </small>
          </div>
          <div class="col-sm text-center">
            <a href="mailto:hello@knownorigin.io" target="_blank">
              <font-awesome-icon :icon="['fas', 'envelope-square']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://medium.com/knownorigin" target="_blank">
              <font-awesome-icon :icon="['fab', 'medium']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://t.me/knownorigin" target="_blank">
              <font-awesome-icon :icon="['fab', 'telegram-plane']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://twitter.com/knownorigin_io" target="_blank">
              <font-awesome-icon :icon="['fab', 'twitter']" size="lg"></font-awesome-icon>
            </a>
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
  import * as mutations from './store/mutation-types';
  import CurrentNetwork from './components/ui-controls/CurrentNetwork';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'app',
    components: {
      FontAwesomeIcon,
      CurrentNetwork
    },
    computed: {
      ...mapGetters([]),
      ...mapState([]),
    },
    mounted() {
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof web3 === 'undefined') {
        console.log('No web3? You should consider trying MetaMask!');
        this.$modal.show('no-web3-found');
        return;
      }

      if (web3) {
        // Use Mist / MetaMask's / provided provider
        let bootStrappedWeb3 = new Web3(web3.currentProvider);
        window.web3 = bootStrappedWeb3;

        // Bootstrap the full app
        this.$store.dispatch(actions.INIT_APP, bootStrappedWeb3);
      }
    },
  };
</script>

<style lang="scss">

  $body-bg: #f2f5fb;
  $body-color: #545454;
  $primary: #3e27d9;

  $font-family-base: 'Avenir', Helvetica, Arial, sans-serif;

  @import '../node_modules/bootstrap/scss/bootstrap.scss';

  /* Sticky footer styles
-------------------------------------------------- */
  html {
    position: relative;
    min-height: 100%;
  }

  body {
    /* Margin bottom by footer height */
    margin-bottom: 70px;
    margin-top: 10px;
    padding-top: 70px;
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
    padding: 60px 15px 0;
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
      color: white;
      padding-left: 2px;
      padding-right: 2px;
    }
  }

  code {
    font-size: 80%;
  }

  .btn-group-vertical > button {
    margin-bottom: 10px;
    border-radius: 10px !important;
  }
</style>
