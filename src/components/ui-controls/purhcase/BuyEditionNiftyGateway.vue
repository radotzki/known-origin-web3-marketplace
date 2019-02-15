<template>
  <div class="mt-2" v-if="edition && edition.active && isNotSoldOut && isNotFree">
    <button type="button"
            class="btn btn-outline-info text-muted btn-block"
            v-on:click="onBuyNiftyGateway">
      <img src="../../../../static/partners/NiftyGatewayLogo.svg" class="nifty-gateway img-fluid"
           style="max-height: 20px"/> Buy with Nifty Gateway ($)
    </button>
  </div>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: 'BuyEditionNiftyGateway',
    components: {},
    props: {
      edition: {
        type: Object
      }
    },
    computed: {
      ...mapState([
        'currentNetworkId'
      ])
    },
    methods: {
      isNotSoldOut() {
        return this.edition.totalAvailable - this.edition.totalSupply > 0;
      },
      isNotFree() {
        return this.edition.priceInEther > 0;
      },
      onBuyNiftyGateway() {
        if (this.edition && this.currentNetworkId === 1) {

          this.$ga.event('purchase-flow', 'buy-now', 'nifty-gateway');

          // to emit event
          window.open('https://niftygateway.com/#/buybutton/' +
            'source=knownorigin' +
            '&' +
            `niftypriceineth=${this.edition.priceInEther}` +
            '&' +
            `editionnum=${this.edition.edition}` +
            '&' +
            `niftyname=${this.edition.name}` +
            '&' +
            `niftysellername=${this.edition.artist.name}` +
            '&' +
            `niftyimageurl=${this.edition.lowResImg}` +
            '&',
            'blank',
            'width=400,height=800'
          );
        }
        if (this.currentNetworkId > 1) {
          alert('Only supported on mainnet for now!');
        }
      },
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card-flex.scss';

  .btn {
    font-size: 14px;
  }

  .btn:hover {
    background-color: #e1e1e1;
  }
</style>


