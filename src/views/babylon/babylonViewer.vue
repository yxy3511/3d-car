<template>
  <div class="page">
    <!-- <babylon model="https://app-common.ks3-cn-beijing.ksyun.com/3d/car-8260230b38d49c38fa3dfffdb6f7ccd5.glb" templates.main.params.fill-screen="true"></babylon> -->
    <babylon extends="minimal">
      <model url="https://app-common.ks3-cn-beijing.ksyun.com/3d/car-8260230b38d49c38fa3dfffdb6f7ccd5.glb">
      </model>
      <camera>
        <behaviors>
          <auto-rotate type="0"></auto-rotate>
        </behaviors>
      </camera>
    </babylon>
  </div>
</template>
<script type="text/javascript">
  // import 'https://cdn.babylonjs.com/viewer/babylon.viewer.js'
  import 'https://preview.babylonjs.com/viewer/babylon.viewer.js'
  export default {
    name: 'model-viewer'
  }
</script>
<style lang="stylus">
  .page {
    width: 100vw;
    height: calc(1.07 * 100vw);
  }
</style>