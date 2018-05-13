<template>
  <div>
    <div class="row">
      <div class="col lead-section">
        <h1>Rare<br/>digital<br/>assets.</h1>
        <p class="lead mt-5">Discover, buy and collect digital artwork by some of the worlds most respected artists, illustrators and creative practitioners.</p>
        <router-link :to="{ name: 'gallery' }" class="btn btn-outline-primary btn-lg">Open gallery</router-link>
      </div>
    </div>

    <div class="row bg-primary" id="brand_logo">
      <div class="col text-center"></div>
    </div>

    <div class="container">
      <div class="row" id="featured">
        <div class="col mt-4">
          <h5 class="text-center pb-4">Featured artists</h5>
          <div class="card-columns">
            <galleryEdition
              v-for="assetEdition, key in lookupAssetsByArtistCode('JOC').slice(0, 3)"
              :edition="assetEdition[0]"
              :key="'JOC' + key">
            </galleryEdition>

            <galleryEdition
              v-for="assetEdition, key in lookupAssetsByArtistCode('LHD')"
              :edition="assetEdition[0]"
              :key="'LHD' + key">
            </galleryEdition>
          </div>

          <div class="m-4 text-center">
            <router-link :to="{ name: 'gallery' }" class="btn btn-outline-primary btn-lg">Open gallery</router-link>
          </div>
        </div>
      </div>
    </div>

    <hr/>

    <div class="row" id="join">
      <div class="col mt-4 mb-4 text-center">
        <h2><strong>Join the collective</strong></h2>
        <!--<p>Head over to our artist micro-site to learn how to get involved...</p>-->
        <!--<a href="https://knownorigin.io" target="_blank" class="btn btn-outline-primary btn-lg">Artist form-->
          <!--<font-awesome-icon :icon="['fas', 'external-link-alt']" class="pl-2"></font-awesome-icon>-->
        <!--</a>-->
        <p class="lead">
          Want to sell digital art on our marketplace?
          <a href="mailto:hello@knownorigin.io" target="_blank" title="Hello">Email</a> us and we can explain how it all works.
        </p>
      </div>
    </div>

    <div class="row" id="how-to">
      <div class="col text-white mt-4 mb-4 d-none d-md-block">
        <h4>Getting started</h4>
      </div>
      <div class="col text-white mt-4 mb-4">
        <h4>A quick guide to buying art with Ethereum.</h4>
        <p>We have created a short guide for those new to cryptocurrencies and Ethereum wallets.</p>
        <p>This will give you the basics you need to purchase Artwork via KnownOrigin.io</p>
        <a href="https://medium.com/knownorigin/getting-started-with-knownorigin-io-a-quick-guide-to-buying-art-with-ethereum-d4dac40a4fea" target="_blank" class="btn btn-outline-light btn-lg">View guide
          <font-awesome-icon :icon="['fas', 'external-link-alt']" class="pl-2"></font-awesome-icon>
        </a>
      </div>
    </div>

    <div class="row" id="quote">
      <div class="col mt-4">
        <blockquote class="blockquote text-right">
          <p class="mb-0">
            <font-awesome-icon :icon="['fas', 'quote-left']"></font-awesome-icon>
            <span class="pl-2 pr-2">Can we use the power of the Blockchain to mint Digital Assets for artwork that evolves proof of ownership, provenance, and authenticity?</span>
            <font-awesome-icon :icon="['fas', 'quote-right']"></font-awesome-icon>
          </p>
          <footer class="blockquote-footer mt-4">
            David, James, &amp; Andy (December 2017)<br/>
            <a href="https://medium.com/knownorigin/pop-up-galleries-artists-and-blockchain-5574115ab507">Read full article
              <font-awesome-icon :icon="['fas', 'external-link-alt']" class="pl-2"></font-awesome-icon>
            </a>
          </footer>
        </blockquote>
      </div>
    </div>

    <div class="row" id="community">
      <div class="col text-white mt-4 mb-4 d-none d-md-block">
        <h4>Community</h4>
        <p class="mt-5">
          <a href="https://t.me/knownorigin_io" target="_blank" class="community-icon m-5" title="Telegram"><font-awesome-icon :icon="['fab', 'telegram-plane']"></font-awesome-icon></a>
          <a href="https://twitter.com/knownorigin_io" target="_blank" class="community-icon m-5" title="Twitter"><font-awesome-icon :icon="['fab', 'twitter']"></font-awesome-icon></a>
        </p>
      </div>
      <div class="col text-white mt-4 mb-4">
        <h4>We are in BETA</h4>
        <p class="lead">Help us become a better product</p>
        <p>Join the community (and talk to us) on
          <a href="https://t.me/knownorigin_io" target="_blank">Telegram <font-awesome-icon :icon="['fas', 'external-link-alt']" class="pl-1"></font-awesome-icon></a>
        </p>
        <p>Or get regular updates on
          <a href="https://twitter.com/knownorigin_io" target="_blank">Twitter <font-awesome-icon :icon="['fas', 'external-link-alt']" class="pl-1"></font-awesome-icon></a>
        </p>
      </div>
    </div>

    <div class="row" id="partners">
      <div class="col mt-4 text-center">
        <h5 class="text-center pb-4">Partners</h5>

        <div class="row">
          <div class="col">
            <img src="../../../static/partners/SHM_icn.png"/>
          </div>
          <div class="col">
            <a href="http://www.blockrocket.tech" target="_blank"><img src="../../../static/partners/BlockRock_icn.png"/></a>
          </div>
          <div class="col">
            <a href="https://trustwalletapp.com/" target="_blank"><img src="../../../static/partners/TrustWallet_icn.png"/></a>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import ArtistShortBio from '../ui-controls/ArtistShortBio';
  import Asset from '../Asset';
  import GalleryEdition from '../GalleryEdition';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'home',
    components: {ArtistShortBio, GalleryEdition, FontAwesomeIcon},
    computed: {
      ...mapGetters(['lookupAssetsByArtistCode'])
    },
    methods: {
      lookupArtist: function () {
        return this.$store.getters.findArtist(this.$route.params.artistCode);
      }
    }
  };
</script>

<style scoped lang="scss">
  $body-bg: #f2f5fb;
  $body-color: #545454;
  $primary: #3e27d9;

  h1 {
    color: #000;
    line-height: 85%;
    font-size: 100px;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
  }

  h2 {
    font-size: 58px;
  }

  h5 {
    text-transform: uppercase;
    color: $primary;
  }

  blockquote {
    font-size: 28px;

    a {
      font-size: 1rem;
    }
  }

  .lead-section {
    margin-left: 250px;
    margin-bottom: 50px;
    margin-top: 65px;
    margin-right: 250px;
  }

  .bg-primary {
    margin-top: 50px;
  }

  .quote {
    font-style: italic;
  }

  #brand_logo {
    min-height: 300px;
    background-image: url('../../../static/1024x576_Dots_letterBox.jpg');
    /*background-repeat: no-repeat;*/
    background-attachment: fixed;
    background-position: center;
  }

  #how-to, #community {
    background-image: url('../../../static/Bigbg.jpg');
    padding-top: 100px;
    padding-bottom: 75px;
    padding-left: 100px;
    padding-right: 100px;

    a {
      color: #FFF;
    }

    .community-icon {
      font-size: 78px;
    }
  }

  #join {
    padding-top: 50px;
    padding-bottom: 50px;
  }

  #featured {
    padding-top: 50px;
    padding-bottom: 10px;
  }

  #quote {
    margin: 100px;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    h1 {
      font-size: 48px;
    }

    h2 {
      font-size: 32px;
    }

    .lead {
      font-size: 1rem;
    }

    .lead-section {
      margin-left: 50px;
      margin-right: 50px;
    }

    blockquote {
      font-size: 1rem;
    }

    #how-to, #community {
      padding-top: 50px;
      padding-bottom: 50px;
      padding-left: 25px;
      padding-right: 25px;
    }

    #brand_logo {
      min-height: 200px;
    }

    #quote {
      margin: 10px;
    }
  }
</style>
