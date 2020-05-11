<template>
  <span></span>
</template>
<script>
  import Typewriter from 'typewriter-effect/dist/core';
  export default {
    props: {
      strings: {
        type: Array,
        required: true,
        default: () => []
      },
      config: {
        type: Object,
        required: false,
        default: () => {}
      }
    },
    data() {
      return {
        instance: null,
      }
    },
    mounted() {
      const newConfig = Object.assign({strings: this.strings},{autoStart: true, loop: true}, this.config);
      this.instance = new Typewriter(this.$el, newConfig);
    },
    destroyed() {
      this.instance.stop();
    }
  }
</script>
