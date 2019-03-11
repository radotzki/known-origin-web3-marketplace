<template>
  <div class="container-fluid mt-4">
    <div class="row editions-wrap">
      <div class="col-sm-4 order-2 order-sm-1 mb-5" v-if="edition">
        <edition-card :edition="edition"></edition-card>

        <div class="shadow-sm bg-white pt-0 pl-4 pr-4 pb-4">
          <small>
            <span class="text-muted">Owned by:</span>
            <clickable-address :eth-address="edition.owner"></clickable-address>
          </small>
          <high-res-download :edition="edition" :version="2" class="mt-3 text-center"></high-res-download>
        </div>
      </div>
      <div class="col-sm-8 order-1 order-sm-2 mb-5">
        <div class="card shadow-sm" v-if="edition">
          <edition-image class="card-img-top" :src="edition.lowResImg" :id="edition.edition"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import EditionCard from "./EditionCard";
  import ClickableAddress from "../generic/ClickableAddress";
  import HighResDownload from "../highres/HighResDownload";
  import EditionImage from "../generic/EditionImage";

  export default {
    name: 'tokenDetails',
    components: {
      EditionImage,
      HighResDownload,
      ClickableAddress,
      EditionCard
    },
    props: {
      edition: {
        type: Object
      }
    },
    computed: {},
    methods: {},
  };
</script>

<style scoped lang="scss">

</style>
