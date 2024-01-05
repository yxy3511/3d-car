<template>
  <div class="page">
    <div class="btn_group">
      <div class="btn" data-id='1' data-color="#9da0a7" @click='changeCarColor(1)'>灰色</div>
      <div class="btn" data-id='1' data-color="#063429" @click='changeCarColor(2)'>绿色</div>
      <div class="btn" data-id='1' data-color="#1b1b1d" @click='changeCarColor(3)'>黑色</div>
      <div class="btn" data-id='19' data-color='#404040' @click='changeTires(3)'>轮胎</div>
      <div class="btn" data-id='19' data-color='#9da0a7' @click='changeTires(1)'>轮胎灰</div>
      <div class="btn" data-id='19' data-color='#063429' @click='changeTires(2)'>轮胎绿</div>
    </div>
    
    <!-- interaction-prompt="none" -->
    <!-- disable-zoom -->
    <!-- camera-orbit="30deg 80deg 150%" -->
    <!-- camera-target="0cm 70cm -5cm" -->
    <!-- scale="0.2 0.2 0.2" -->
    <!-- camera-orbit="30deg 90deg 150%" -->
    <!-- https://app-common.ks3-cn-beijing.ksyun.com/3d/concept_car-d519aa6d2e4379466feda92c42f1f11a.glb   animates-->
    <!-- https://app-common.ks3-cn-beijing.ksyun.com/3d/car-8260230b38d49c38fa3dfffdb6f7ccd5.glb -->
    <model-viewer
      id='modelViewer'
      src="https://app-common.ks3-cn-beijing.ksyun.com/3d/car-8260230b38d49c38fa3dfffdb6f7ccd5.glb"
      ios-src="https://modelviewer.dev/shared-assets/models/Astronaut.usdz"
      alt="A 3D model of an astronaut"
      environment-image="legacy"
      loading='eager'
      camera-controls
      max-camera-orbit="auto 90deg auto"
      camera-orbit="30deg 90deg 150%"
      disable-tap
      disable-zoom
      shadow-intensity="1"
      shadow-softness="0.8"
    >
      <!-- <button class="Hotspot" slot="hotspot-1" data-position="0.6063145251177828m 0.40008946368426074m 0.8119695219491698m" data-normal="0.28349223346613134m -0.31583563646833784m 0.90547225484883m" data-visibility-attribute="visible" @click="toPoint(1)">
        <div class="HotspotAnnotation">1</div>
      </button>
      <button class="Hotspot" slot="hotspot-2" data-position="0.4904621404341412m 0.6230094964874408m 1.2987737296355666m" data-normal="0.6191178020666447m 0.16362878448103363m 0.7680616954733691m" data-visibility-attribute="visible" @click="toPoint(2)">
        <div class="HotspotAnnotation">2</div>
      </button>
      <button class="Hotspot" slot="hotspot-3" data-position="-0.4898193539142914m 0.45184139958198577m 1.4029626092568388m" data-normal="0.14045398289696995m -0.26070931461991914m 0.9551457124223454m" data-visibility-attribute="visible" @click="toPoint(3)">
        <div class="HotspotAnnotation">3</div>
      </button> -->
    </model-viewer>
  </div>
</template>

<script>
  import { onMounted } from 'vue'
  // import "@google/model-viewer";
  export default {
    setup () {
      onMounted (() => {
        const modelViewer = document.querySelector("model-viewer#modelViewer");

        // let original = null
        // let texture2 = null
        const pathArr = [
          '30deg 90deg 120%',
          '-10deg 80deg 120%',
          '-50deg 80deg 120%',
          '-100deg 80deg 120%',
          '-180deg 80deg 120%',
          '-220deg 80deg 120%',
          '-270deg 80deg 120%'
        ]
        let progressVal = null
        
        modelViewer.addEventListener('progress', e => {
          const params = {
            code: 1,
            message: 'progress',
            progress: null
          }
          /*节流*/
          if (!progressVal || e.detail.totalProgress - progressVal > 0.01) {
            progressVal = e.detail.totalProgress
            params.progress = e.detail.totalProgress
            window.NativeAppCar?.postMessage(JSON.stringify(params))
          }
        })

        modelViewer.addEventListener("load", async () => {
          // 缩小模型，此处更改大小相机不会自适应
          modelViewer.scale = '0.9 0.9 0.9'

          // 给客户端发送消息
          const params = {
            code: 0,
            message: 'Loading completed'
          }
          window.NativeAppCar?.postMessage(JSON.stringify(params))

          // 关闭交互引导
          setTimeout(() => {
            modelViewer.interactionPrompt = 'none'
          }, 6000)

          // 更改车身颜色
          changeCarColor(3)

        })
      })

      const toPoint = async function (index) {
        modelViewer.disableZoom = false
        const position = {
          1: '40deg 90deg -50cm',
          2: '20deg 90deg -70cm',
          3: '-10deg 90deg -80cm',
        }
        modelViewer.cameraOrbit = position[index]

      }

      const playAnimate = async function (index) {
        const animations = modelViewer.availableAnimations
        modelViewer.animationName = animations[index]
        await modelViewer.updateComplete;
        modelViewer.play({repetitions: 1})
      }

      const fadeOut = function () {
        let count = 0
        modelViewer.cameraTarget="0cm 70cm 0cm"
        const interval = setInterval(() => {
          if (count < pathArr.length) {
            modelViewer.cameraOrbit = pathArr[count++]
          } else {
            modelViewer.cameraTarget="-3m 50cm 0m"
            interval && clearInterval(interval)
            count = 0
          }
        }, 100)
      }

      const fadeIn = function () {
        let fadeInCount = pathArr.length - 1
        modelViewer.cameraTarget="0cm 70cm 0cm"
        const fadeInterval = setInterval(() => {
          if (fadeInCount > -1) {
            modelViewer.cameraOrbit = pathArr[fadeInCount--]
          } else {
            fadeInterval && clearInterval(fadeInterval)
            fadeInCount = pathArr.length - 1

          }
        }, 100)
      }

      const bodyColors = {
        1: '#b4b6bb',
        2: '#175740',
        3: '#212121'
      }
      const tiresColor = {
        1: '#9b9c9e',
        2: '#134633',
        3: '#404040'
      }
      const imgs = {
        1: './assets/gray2.png',
        2: './assets/green2.png',
        3: './assets/black-carcolor.png'
      }
      function changeTires (type) {
        const material = modelViewer.model.materials;
        material[19].pbrMetallicRoughness.setBaseColorFactor(tiresColor[type]);
      }
      async function changeCarColor (type) {
        // type === 3 ? fadeIn() : fadeOut()
        const material = modelViewer.model.materials;
        material[1].pbrMetallicRoughness.setBaseColorFactor(bodyColors[type]);
        material[4].pbrMetallicRoughness.setBaseColorFactor(type === 3 ? '#5f5e5e' : null); //#5f5e5e

        const texture = await modelViewer.createTexture(imgs[type]);
        material[4].pbrMetallicRoughness.baseColorTexture.setTexture(texture)
        material[4].pbrMetallicRoughness.metallicRoughnessTexture.setTexture(type === 3 ? texture : null)
      }

      return {
        changeCarColor,
        changeTires
      }
    }
  }
</script>
<style type="text/css">
  body {
    margin: 0;
  }
  #modelViewer {
    width: 100vw;
    height: calc(1.07 * 100vw);
    background: linear-gradient(to bottom, #050505 0%, #2E2E2E 60%, #050505 95%);
    /*background-image: url('./assets/bg-color.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;*/
  }
  .page {
    position: relative;
  }
  .btn_group {
    z-index: 99;
    position: absolute;
    right: 30px;
    top: 450px;
    display: flex;
    flex-direction: column;
  }
  .btn {
    display: block;
    width: 120px;
    line-height: 30px;
    background: #fff;
    color: #000;
  }
  .Hotspot {
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #fff;
    color: #fff;
    /*position: relative;*/
    border-color: transparent;
    background-color:rgba(255,255,255,.4);
  }
  /*.HotspotAnnotation {
    display: block;
    position: absolute;
    left: 40px;
    top: 0px;
    background: #fff;
    width: max-content;
    padding: 3px 4px;
  }*/
</style>