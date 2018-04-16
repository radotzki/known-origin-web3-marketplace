<template>
  <div id="app">

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

    <div class="margin-bottom">
      <router-view></router-view>
    </div>

    <footer id="footer">
      <table width="100%">
        <tr>
          <td width="80%">
            <p>&copy; 2018 KNOWNORIGIN</p>
            <p>BE ORIGINAL. BUY ORIGINAL.</p>
            <current-network></current-network>
          </td>
          <td width="20%">

            <router-link :to="{ name: 'gallery' }">Gallery</router-link> <br/> <br/>
            <router-link :to="{ name: 'account' }">My Account</router-link> <br/> <br/>
            <router-link :to="{ name: 'details' }">Contract</router-link> <br/> <br/>
            <router-link :to="{ name: 'license' }">License</router-link> <br/> <br/>
            <router-link :to="{ name: 'assets' }">Assets</router-link> <br/> <br/>
          </td>
        </tr>
        <!--<tr>-->
          <!--<td width="80%">-->
            <!--<a href="mailto:hello@knownorigin.io">hello@knownorigin.io</a> <br/> <br/>-->
            <!--<a href="https://t.me/knownorigin" target="_blank">Join us on Telegram</a> <br/> <br/>-->
            <!--<a href="https://twitter.com/knownorigin_io" target="_blank">Follow us on Twitter</a> <br/> <br/>-->
            <!--<a href="https://medium.com/knownorigin" target="_blank">Medium articles</a>-->
          <!--</td>-->
          <!--<td width="20%">-->
            <!--<p><current-network></current-network></p>-->
          <!--</td>-->
        <!--</tr>-->
      </table>
    </footer>
  </div>
</template>

<script>
  /* global web3:true */

  import Web3 from 'web3';
  import {mapGetters, mapState} from 'vuex';
  import * as actions from './store/actions';
  import * as mutations from './store/mutation-types';
  import CurrentNetwork from './components/ui-controls/CurrentNetwork';

  export default {
    name: 'app',
    components: {CurrentNetwork},
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
  $primary: #3e27d9;
  $secondary: #f2f2f2;
  $background: #f2f5fb;
  $gray: #545454;
  $white: #FDFDFD;
  $font_family_1: 'Avenir', Helvetica, Arial, sans-serif;

  $sold: red;
  $warning: darkorange;
  $success: #2ed573;

  /*--------------------------------------------------------------
    Header styles minus menu
    --------------------------------------------------------------*/
  /* Flexbox styles */
  /* mq 40em*/
  /* mq 60em*/
  h1 {
    display: block;
    font-size: 38px;
    margin-top: 20px;
    margin-bottom: 20px;
    color: $gray;
    border-bottom: 1px;
    padding-bottom: 20px;
    padding-left: 25px;
  }

  h2 {
    color: $gray;
    display: block;
    font-size: 26px;
    margin-top: 20px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    padding-left: 25px;
  }

  h3 {
    display: block;
    color: $gray;
    font-size: 16px;
    margin-top: 15px;
    margin-bottom: 15px;
    font-weight: bold;
    padding-left: 25px;
  }

  h4 {
    color: $primary;
    font-weight: bold;
    font-size: 16px;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  p {
    line-height: 28px;
    margin-bottom: 10px;
    color: $gray;
    padding-left: 25px;
    padding-right: 25px;
  }

  td {
    vertical-align: middle;
  }

  #footer p {
    color: rgba(255, 255, 255, 0.5);
  }

  * {
    box-sizing: border-box;
    vertical-align: middle;
  }

  .btn {
    display: block;
    width: 100%;
    color: $white;
    font-size: 20px;
    padding: 10px 20px 10px 20px;
    text-decoration: none;
    text-align: center;
    border: solid $primary 2px;
    border-radius: 28px;

    &:hover {
      text-decoration: none;
    }

    &.btn-sm {
      width: 50% !important;
    }

    &.btn-action {
      background-color: $primary;
      color: $white;
      border: solid $primary 2px;
    }

    &.btn-sold {
      background-color: $sold;
      color: $white;
      border: solid $sold 2px;
    }

    &.btn-link {
      color: $primary;
      border: solid $primary 2px;
    }

    &.btn-warning {
      background-color: $warning;
      border: solid $warning 2px;
      color: $white;
    }

    &.btn-danger {
      background-color: $sold;
    }

    &.btn-success {
      background-color: $success;
      border: solid $success 2px;
      color: $white;

      &:disabled {
        background: $gray;
        text-decoration: none;
        border: solid $gray 2px;
      }
    }

    &.btn-muted {
      border: solid $gray 2px;
      color: $gray;
    }
  }

  #app {
    font-family: $font_family_1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: $background;
    margin: 0;
  }

  a {
    color: $primary;
  }

  #header {
    color: $primary;
    padding-top: 10px;
    padding-bottom: 25px;
    margin-bottom: 35px;
    margin-top: 10px;
    background-color: $white;
  }

  #footer {
    background-color: $primary;
    color: $secondary;
    padding: 10px;
    padding-bottom: 50px;

    a {
      color: $secondary;
      text-decoration: none;
    }
  }

  .header-branding {
    font-weight: 300;
    font-style: normal;
    font-size: 26px;
    letter-spacing: 0em;
    line-height: 1em;
    text-transform: none;
    color: $primary;
    padding-left: 25px;
  }

  .centered {
    margin: 0 auto;
    padding: 0 10px;
  }

  .pad-top {
    padding-top: 20px;
  }

  .pad-bottom {
    padding-bottom: 20px;
  }

  .margin-bottom {
    margin-bottom: 150px;
  }

  .card {
    background: $white;
    margin-bottom: 15px;
  }

  .card-content {
    padding: 10px;
    width: 100%;

    h2 {
      margin-top: 0;
      margin-bottom: .5em;
      font-weight: normal;
      text-align: center;
    }

    h3 {
      padding-left: 0px;
    }

    p {
      font-size: 95%;
      padding-left: 0px;
    }
  }

  #artists {
    margin-top: 20px !important;

    .card-content {
      box-shadow: inset 0 -1px 0px rgba(0, 0, 0, 0.1);
    }

    .card {
      background: $background;
    }

    h2 {
      margin-bottom: 40px !important;
    }

    h3 {
      color: $primary;
    }

    img, .artists img {
      width: 50%;
    }

  }

  img {
    width: 100%;
    height: auto;
  }

  .muted {
    color: $gray;
  }

  .bold {
    font-weight: bold;
  }

  .pull-right {
    float: right;
    text-decoration: none;
  }

  .header-dash {
    text-decoration: none;
  }

  .back-arrow {
    font-size: 1.25em;
    text-decoration: none;
    padding-right: 20px;
  }

  .btn-sold {
    background-color: $sold;
    color: $white;
  }

  .token-id {
    font-weight: bold;
    color: $gray;
  }

  @media screen and (min-width: 40em) {
    .cards {
      margin-top: -1em;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .card {
      margin-bottom: 1em;
      display: flex;
      flex: 0 1 calc(50% - 0.5em);
    }

    .assets_to_buy {
      padding-left: 25px;
    }
  }

  @media screen and (min-width: 60em) {
    .cards {
      margin-top: inherit;
    }
    .card {
      margin-bottom: 2em;
      display: flex;
      flex: 0 1 calc(33% - 0.5em);
    }

    .assets_to_buy {
      padding-left: 25px;
    }
  }

  @media only screen and (max-width: 768px) {

  }

  .thumbnail {
    text-align: center;
  }

  .uppercase {
    text-transform: uppercase;
    text-align: center;
    font-size: 20px;
    font-weight: 400;
  }

  .edition-type {
    position: absolute;
    background-color: $primary;
    color: $secondary;
    padding: 10px;
    opacity: 0.8;
  }

  .edition-sold {
    position: absolute;
    background-color: $sold;
    color: $secondary;
    padding: 10px;
    opacity: 0.6;
    font-size: 1.25em;
  }

  .edition-run {
    background-color: $gray;
    color: $white;
    border-radius: 28px;
    padding-left: 15px;
    padding-right: 15px;
    opacity: 0.6;
  }

  .error {
    background-color: $sold;
  }

  strong {
    font-weight: bold;
  }

  .license-text {
    font-size: 0.8em;
    margin: 5px;
  }

  .current-network {
    font-size: 12px;
  }

  .assets_to_buy {
    max-width: 400px;
  }

  .twitterLink {
    display: block;
    text-align: center;
    margin-top: 20px;

  }

  .artist-info {
    display: flex;
    height: 90%;
    flex-direction: column;
  }

  .text-danger {
    color: $sold !important;
  }

  .text-success {
    color: $success !important;
  }

  .text-muted {
    color: $gray !important;
  }

  .text-center {
    text-align: center;
  }

  .text-blue {
    color: #4A90E2 !important;
  }

  .no-web3-found-container {
    margin: 10px;
  }

  .loading {
    padding-top: 20px;
    font-weight: bold;
    font-size: 32px;
  }
</style>
