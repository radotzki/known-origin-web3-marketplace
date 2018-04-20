<template>
  <div class="card" v-if="edition">

    <img class="card-img-top" :src="edition.lowResImg"/>

    <ul class="list-group list-group-flush">
      <li class="list-group-item bg-danger text-center text-white" v-if="availableAssetsForEdition(edition.edition).length == 0">
        SOLD
      </li>
    </ul>

    <div class="card-body">

      <p class="card-text">
        <span class="badge badge-light">1 of {{ assetsForEdition(edition.edition).length }}</span>
        <span class="badge badge-light">{{ availableAssetsForEdition(edition.edition).length }} available</span>
      </p>

      <edition-name-by-artist :edition="edition" :purchase="purchase"></edition-name-by-artist>

      <p class="card-text" v-if="purchase">{{ edition.description }}</p>
    </div>

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center"><price-in-eth :value="edition.priceInEther"></price-in-eth></li>
    </ul>

    <div class="card-footer text-center" v-if="!purchase">
      <router-link class="btn btn-outline-primary btn-block" tag="button" :to="{ name: 'confirmPurchase', params: { artistCode: edition.edition.substring(0, 3), edition: edition.edition }}">
        View details
      </router-link>
    </div>

    <div class="card-footer text-center" v-if="purchase">
      <confirm-purchase-button :edition="edition"></confirm-purchase-button>
    </div>

  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import PriceInEth from './ui-controls/PriceInEth.vue';
  import EditionNameByArtist from './ui-controls/EditionNameByArtist.vue';
  import ConfirmPurchaseButton from './ui-controls/ConfirmPurchaseButton';
  import AssetFigure from './AssetFigure.vue';

  export default {
    name: 'galleryEdition',
    components: {PriceInEth, AssetFigure, EditionNameByArtist, ConfirmPurchaseButton},
    props: {
      edition: {
        required: true,
        type: Object
      },
      purchase: {
        type: Boolean
      },
    },
    computed: {
      ...mapGetters([
        'availableAssetsForEdition',
        'assetsForEdition',
      ]),
    },
    methods: {
    }
  };
</script>

<style scoped lang="scss">
</style>
