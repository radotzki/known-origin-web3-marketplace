<template>
  <a v-if="edition"
     class="twitter-share-button"
     target="_blank"
     :href="purchaseText">
    Tweet
  </a>
</template>

<script>
  export default {
    name: 'tweetEditionButton',
    props: ['edition'],
    computed: {
      purchaseText: function () {
        let artistAccount = this.edition.artistAccount;
        let editionNumber = this.edition.edition;
        let url = `${window.location.origin}/artists/${artistAccount}/editions/${editionNumber}`;
        let text = `Check out this awesome KnownOrigin digital asset`;
        let hashtags = 'KnownOrigin,DApp,ethereum,nft,erc721,blockchain,art';
        let via = "knownorigin_io";
        return `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=${via}`;
      }
    },
    mounted: function () {
      this.$nextTick(function () {
        if (twttr.widgets.load) {
          twttr.widgets.load();
        }
      });
    }
  };
</script>

<style scoped>

</style>
