
<template>
  <span class="attributes">

    <!--<span v-if="attributes">-->
        <!--<button class="btn btn-link" v-on:click="isActive = !isActive" v-if="!isActive">more</button>-->
    <!--</span>-->

    <span v-for="(value, key) in attributes.attributes">
      <span v-if="isArray(value)">
        <span v-for="v in value" class="tag pl-2 pr-2" v-if="v != 'high res'">#{{v}}</span>
      </span>
      <!--<span v-else>-->
        <!--<span class="badge badge-light" v-if="value != 'high res'">{{value}}</span>-->
      <!--</span>-->
    </span>

  </span>
</template>

<script>
  export default {
    name: 'metadataAttributes',
    props: ['attributes'],
    data() {
      return {
        isActive: false
      };
    },
    methods: {
      isString: function (value) {
        return value instanceof String;
      },
      isArray: function (value) {
        return value instanceof Array;
      },
      isBoolean: function (value) {
        return value instanceof Boolean;
      },
      isNumber: function (value) {
        return value instanceof Number;
      },
    }
  };
</script>

<style scoped lang="scss">
  button {
    font-size: 0.7rem;
    padding: 0;
  }
</style>
