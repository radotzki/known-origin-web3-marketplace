<template>
  <vue-goodshare-twitter
    :page_title="page_title"
    :title="title"
    :page_url="url"
    title_social="Tweet"
    button_design="outline"
    class="small"
    has_icon
    v-if="edition">
  </vue-goodshare-twitter>
</template>


<script>
  import VueGoodshareTwitter from "vue-goodshare/src/providers/Twitter";
  import {mapGetters, mapState} from 'vuex';

  export default {
    components: {
      VueGoodshareTwitter,
    },
    name: 'twitterButton',
    props: ['edition'],
    computed: {
      ...mapGetters([
        'findArtistsForAddress'
      ]),
      ...mapState([
        'currentUsdPrice',
      ]),
      title() {
        const artist = this.findArtistsForAddress(this.edition.artist.ethAddress);
        if (artist) {
          return `KnownOrigin.io - ${this.edition.name} by ${this.edition.artist.name} ${artist.twitter || ""} @KnownOrigin_io.io`;
        }
      },
      page_title() {
        const hashTags = (this.edition.attributes.tags || []).map((e) => {
          if (e === 'high res') {
            return `#highres`;
          }
          return `#${e}`;
        }).join(' ');
        const artist = this.findArtistsForAddress(this.edition.artist.ethAddress);
        const price = `ETH ${this.edition.priceInEther} ($${this.usdPrice(this.edition.priceInEther)})`;
        if (artist) {
          return `🙌 Check out this digital artwork ${this.edition.name} by ${this.edition.artist.name} ${artist.twitter || ""} - Edition 1 of ${this.edition.totalAvailable} available now ${price} @knownOrigin.io ${hashTags}`;
        }
      },
      url() {
        return `https://dapp.knownorigin.io/edition/${this.edition.edition}`;
      },
    },
    methods: {
      usdPrice(priceInEther) {
        if (this.currentUsdPrice && priceInEther) {
          const value = this.currentUsdPrice * priceInEther;
          return value.toFixed(2);
        }
        return 0;
      }
    }
  };
</script>

<style scoped>
  .twitter__design__outline {
    color: #1da1f2 !important;
  }

  .button-social {
    padding: 3px !important;
  }
</style>
