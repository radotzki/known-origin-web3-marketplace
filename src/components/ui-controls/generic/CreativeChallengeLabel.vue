<template>
  <span v-if="devcon4">
    <img src="../../../../static/devcon_iv_logo.svg" class="img-fluid creative-challenge mr-2"/>
  </span>
</template>

<script>
  import _ from 'lodash';

  export default {
    name: 'CreativeChallengeLabel',
    props: ['attributes'],
    computed: {
      devcon4: function () {
        if (this.attributes) {
          const tags = _.get(this.attributes, 'tags', []);
          return _.includes(tags, 'creative challenge') && _.includes(tags, 'devcon4');
        }
        return null;
      },
      _0xcert: function () {
        if (this.attributes) {
          const tags = _.get(this.attributes, 'tags', []);
          return _.includes(tags, 'creative challenge') && _.includes(tags, '0xcert');
        }
        return null;
      }
    }
  };
</script>

<style scoped>

  .creative-challenge {
    max-height: 20px;
  }
</style>
