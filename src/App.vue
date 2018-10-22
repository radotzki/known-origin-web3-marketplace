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
            <router-link :to="{ name: 'account' }" class="nav-link">
              Account
              <span class="badge badge-primary" v-if="totalPurchases() > 0">{{ totalPurchases() }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
      <network-warning-banner></network-warning-banner>
    </header>

    <main role="main" class="container-fluid">
      <router-view></router-view>
      <current-network class="small text-muted float-right mr-4"></current-network>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col d-none d-md-inline">
            <small class="slogan">BE ORIGINAL. BUY ORIGINAL.</small>
          </div>
          <div class="col-xs col-sm text-center mb-2">
            <small>
              <router-link :to="{ name: 'gallery' }">Gallery</router-link> &bull;
              <router-link :to="{ name: 'artists' }">Artists</router-link> &bull;
              <router-link :to="{ name: 'contracts' }">Contract</router-link> &bull;
              <router-link :to="{ name: 'activity' }">Activity</router-link>
            </small>
          </div>
          <div class="col-xs col-sm text-center">
            <a href="mailto:hello@knownorigin.io" target="_blank" class="p-2" title="Mail">
              <font-awesome-icon :icon="['fas', 'envelope-square']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://twitter.com/knownorigin_io" target="_blank" class="p-2"title="Twitter">
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
        <div class="row">
          <div class="col">
            <!-- Begin Mailchimp Signup Form -->
            <div id="mc_embed_signup">
              <form action="https://knownorigin.us19.list-manage.com/subscribe/post?u=84b0312927af7712ac2e6dd5a&amp;id=70433f1407" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
                <div id="mc_embed_signup_scroll">

                  <input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="Subscribe to The Origin Weekly..." required>
                  <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
                  <div style="position: absolute; left: -5000px;" aria-hidden="true"><input type="text" name="b_84b0312927af7712ac2e6dd5a_70433f1407" tabindex="-1" value=""></div>
                  <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button btn"></div>
                </div>
              </form>
            </div>
            <!--End mc_embed_signup-->
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
  import CurrentNetwork from './components/ui-controls/generic/CurrentNetwork';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import NetworkWarningBanner from './components/ui-controls/generic/NetworkWarningBanner';

  export default {
    name: 'app',
    components: {
      NetworkWarningBanner,
      FontAwesomeIcon,
      CurrentNetwork
    },
    computed: {
      ...mapGetters(['totalPurchases']),
      ...mapState([]),
    },
    methods: {},
    mounted() {
      if (window.ethereum) {
        window.web3 = new Web3(ethereum);

        // Request account access if needed
        ethereum.enable()
          .then((value) => {
            console.log("Bootstrapping web app - provider acknowedgled", value);
            this.$store.dispatch(actions.INIT_APP, window.web3);
          })
          .catch((error) => {
            console.log('User denied access, boostrapping application using infura', error);
            window.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/nbCbdzC6IG9CF6hmvAVQ'));
            this.$store.dispatch(actions.INIT_APP, window.web3);
          });

      } else if (window.web3) {
        console.log("Running legacy web3 provider");
        window.web3 = new Web3(web3.currentProvider);
        this.$store.dispatch(actions.INIT_APP, window.web3);

      } else {
        console.log("Running without a web3 provider - falling back to infura");

        window.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/nbCbdzC6IG9CF6hmvAVQ'));
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        this.$store.dispatch(actions.INIT_APP, window.web3);
      }
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

    .editions-wrap {
      margin: 0 !important;
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

  .card-desc {
    font-size: 0.75rem;
  }

  .artist-name {
    font-size: 0.9rem;
  }

  .artist-name-lg {
    font-size: 0.9rem;
  }

  .artist-link {
    color: $secondary;
  }

  .artist-avatar {
    max-width: 30px;
  }

  .tag {
    font-size: 0.75rem;
    display: inline-block;
  }

  .editions-wrap {
    margin-left: 50px;
    margin-right: 50px;
  }

  #mc_embed_signup {
    background: $primary;
    color: $body-bg;
    clear: left;
    font: 14px Helvetica, Arial, sans-serif;
    width: 100%;
  }

</style>
