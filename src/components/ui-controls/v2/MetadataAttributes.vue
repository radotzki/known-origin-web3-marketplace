
<template>
  <div>
    <div v-for="(value, key) in attributes">
      <div v-if="isArray(value) && v !== 'high res'"
            v-for="v in value" class="tag">#{{v}} &nbsp;
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'metadataAttributes',
    props: ['attributes'],
    data() {
      return {
        isActive: true
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

</style>
