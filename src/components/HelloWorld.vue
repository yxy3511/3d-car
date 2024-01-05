
<template>
  <div class="page" @click='hideHover'>
    <canvas id="renderCanvas" touch-action="none"></canvas>
    <div class="toolbar" v-if='visible'>
      <button class='opt_btn' @click='initGround'>切换场景</button>
      <div class="change_colors">
        <button  class='opt_btn' @click.stop='showOptBtns(1)' >切换视角</button>
        <div class="colors_div" v-if='hoverVisible === 1' @click.stop>
          <button @click='changeView(1)'>车外</button>
          <button @click='changeView(2)'>驾驶座</button>
          <button @click='changeView(3)'>副驾驶座</button>
        </div>
      </div>
      <button class='opt_btn' @click='clickBtn()'>开关门</button>
      <button class='opt_btn' @click='controlLights'>开关灯</button>
      <div class="change_colors">
        <button  class='opt_btn' @click.stop='showOptBtns(2)' >换皮肤</button>
        <div class="colors_div" v-if='hoverVisible === 2' @click.stop>
          <button @click='changeCarColor("https://app-common.ks3-cn-beijing.ksyun.com/3d/Black-ca2c4af1d01d365670c91716f58ed4c3.png")'>换黑色</button>
          <button @click='changeCarColor("https://app-common.ks3-cn-beijing.ksyun.com/3d/Blue-30ba293827b41166248779993e273af5.png")'>换蓝色</button>
          <button @click='changeCarColor("https://app-common.ks3-cn-beijing.ksyun.com/3d/Red-babcd5859dc8f8493a343b4267badea7.png")'>换红色</button>
          <button @click='changeCarColor("https://app-common.ks3-cn-beijing.ksyun.com/3d/Yellow-76c732a2f45807ee0189e3279ee0b559.png")'>换黄色</button>
          <button @click='changeCarColor("https://app-common.ks3-cn-beijing.ksyun.com/3d/green-d318efbc0b11e9d181a341acb6556563.png")'>换绿色</button>
        </div>
      </div>
      <button class='opt_btn' v-if='animateCount && animateCount % 2 !== 0' @click='drivingAnimation()'>停止行驶</button>
      <button class='opt_btn' v-else @click='drivingAnimation()'>行驶</button>
    </div>
  </div>
</template>
<script>
import { defineComponent, onMounted, ref } from 'vue'
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import * as GUI from '@babylonjs/gui/2D';
export default defineComponent({
  name: 'Page',
  components: {
  },
  setup () {
    let scene = null
    let camera = null
    let canvas = null
    let carAnimation = null
    const animateCount = ref(0)
    let animations = []
    const visible = ref(false)
    const hoverVisible = ref(0)
    const isLighted = ref(false)
    let newMeshesData = []
    let light1 = null
    let light2 = null
    let largeGround = null
    let skybox = null
    let skyboxMaterial = null
    let timeout = null
    let isLoading = false

    const clickNum = ref(0)
    const clickBtn = function (callback) {
      if (timeout) return
      animations[0].play();
      timeout = setTimeout(() => {
        const openSound = new BABYLON.Sound('openDoor', "https://app-common.ks3-cn-beijing.ksyun.com/3d/open-f04d8ea3e2ff380318240b9c5fde4505.mp3", scene, null, {
          autoplay: true,
          loop: false
        })
        // openSound.play()
      }, 1800)
      setTimeout(() => {
        const closeSound = new BABYLON.Sound('closeDoor', "https://app-common.ks3-cn-beijing.ksyun.com/3d/close-ec0f4dadab9e33fa428fe1111debcaa3.mp3", scene, null, {
          autoplay: true,
          loop: false
        })
        // closeSound.play()
        timeout && clearTimeout(timeout)
        timeout = null
        callback && callback()
      }, 10700)
      
    }
    onMounted(() => {

      canvas = document.getElementById("renderCanvas"); // Get the canvas element
      const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

      scene = new BABYLON.Scene(engine);
      scene.useRightHandedSystem = true;

      scene.onPointerObservable.add((pointerInfo) => {            
          switch (pointerInfo.type) {
              case BABYLON.PointerEventTypes.POINTERDOWN:
                  if(pointerInfo.pickInfo.hit) {
                      pointerDown(pointerInfo.pickInfo.pickedMesh)
                  }
              break;
          }
      });
      
      // 天空和地面
      skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:100}, scene);
      initGround()

      // camera
      changeView(1)

      // Register a render loop to repeatedly render the scene
      engine.runRenderLoop(function () {
        scene.render();
      });
      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-0.8, 0.6, 0), scene);

      // SpotLight 0.6, 0.5, 0.7 
      /*
        pointLight 
        parent mesh: 0.63, 0.51, 0.72/0.62, 0.5, 0.78/0.64, 0.5, 0.73
        scen: 0.62, 0.76, 1.9
      */
      light1 = new BABYLON.PointLight("pointLight1", new BABYLON.Vector3(0.64, 0.5, 0.73), scene);
      light2 = new BABYLON.PointLight("pointLight2", new BABYLON.Vector3(-0.64, 0.5, 0.73), scene);
      // light1.INTENSITYMODE_AUTOMATIC = 11
      light1.intensity = 0;
      light2.intensity = 0;
      light1.diffuse = BABYLON.Color3.White();
      light2.diffuse = BABYLON.Color3.White();
      light1.range = 15;
      light2.range = 15;

      // Watch for browser/canvas resize events
      // window.addEventListener("resize", function () {
      //   engine.resize();
      // });

      /*BABYLON.SceneLoader.ImportMesh("", "/static/3d/", "Main.babylon", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
        console.log('newMeshes:', newMeshes)
        console.log('skeletons:', skeletons)
        console.log('animationGroups:', animationGroups)
      });*/

      BABYLON.SceneLoader.ImportMesh("", "", "https://app-common.ks3-cn-beijing.ksyun.com/3d/concept_car-d519aa6d2e4379466feda92c42f1f11a.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
        animationGroups.forEach(group => {
          animations.push(group)
          group.stop();
          // group.reset();
        });
        // UiPanel.isVisible = true
        visible.value = true

        newMeshesData = newMeshes
        newMeshesData[0].scaling = new BABYLON.Vector3(-1, 1, -1);
        // newMeshesData[0].position = new BABYLON.Vector3(-1, 1, 35);
        camera.parent = newMeshesData[0]
        camera.ignoreParentScaling = true

      });

    })

    const pointerDown = (mesh) => {
      console.log('mesh:', mesh)
      if (isLoading) return
      if (mesh.id === "Object_458" || mesh.id === "Object_444") {
        isLoading = true
        clickBtn(() => {
          isLoading = false
        })
        setTimeout(() => {
          changeView(mesh.id === "Object_458" ? 3 : 2)
        }, 5000)
      }
    }

    const initGround = function () {
      clickNum.value += 1
      if (clickNum.value % 2 === 0) {
        skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        // 获取不到图片，因为后端上传图片加了md5
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/src/assets/image/skybox02", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        largeGround?.dispose()
      } else {
        skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/src/assets/image/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        largeGround?.dispose()

        const largeGroundMat = new BABYLON.StandardMaterial("largeGroundMat");
        largeGroundMat.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/environments/valleygrass.png");
        largeGroundMat.specularColor = new BABYLON.Color3(0, 0, 0);// 使材质不反光
        // largeGroundMat.opacityFresnel = false;

        // largeGround = BABYLON.MeshBuilder.CreateGround("largeGround", {width:150, height:150, subdivisions: 20, minHeight:0, maxHeight: 10});
        // largeGround.material = largeGroundMat;
        // largeGround.position.y = -0.01;

        largeGround = BABYLON.MeshBuilder.CreateGroundFromHeightMap("largeGround", "https://assets.babylonjs.com/environments/villageheightmap.png", {width:200, height:200, subdivisions: 20, minHeight:0, maxHeight: 10});
        largeGround.material = largeGroundMat;
        largeGround.position.y = -0.01;
        largeGround.isVisible = true;
        largeGround.receiveShadows = true;
      }
    }

    const changeCarColor = function (url) {
      const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
      myMaterial.diffuseTexture = new BABYLON.Texture(url, scene);
      const showIds = [
        // 'Cube.029_headlight_cover_0' // 前车灯
        "Cube.032_plastic_matte_3_0", // 后下
        "Object_460", // 前下盘
        "Object_462", // 右侧后视镜壳
        "Object_464", // 右侧后视镜
        "Object_458", // 右侧门
        // "Object_456", // 右前玻璃
        "Object_454", // 左前下盘
        // "Object_452", // 左前玻璃
        // "Object_450", // 左侧后玻璃
        "Object_448", // 左侧后视镜框边
        "Object_446", // 左侧后视镜
        "Object_444",
        // "Object_442",
        "Object_440"
      ]

      newMeshesData.forEach((mesh,index) => {
        /*if (index === 149) {
          camera.parent = mesh
        }*/
        if (index > 123 && index < 194 && (mesh.id.includes('body') || showIds.includes(mesh.id))) {
          mesh.material = myMaterial;
        }
      })
    }

    const wheelAnimation = function () {
      newMeshesData.forEach(mesh => {
        if (mesh.id.includes('wheel') || mesh.id.includes('tire')){
          mesh.rotate(BABYLON.Axis.X, Math.PI/4, BABYLON.Space.LOCAL);
        }
      })
    }

    let intervalID = null
    const drivingAnimation = function (isClose=false) {
      !isClose && (animateCount.value += 1);
      if ((animateCount.value % 2 === 0 && carAnimation) || isClose) {
        carAnimation?.pause();
        intervalID && clearInterval(intervalID)
        return
      } else if (carAnimation) {
        carAnimation.restart()
        intervalID = setInterval(() => { wheelAnimation() }, 100)
        return
      }

      const animCar = new BABYLON.Animation("carAnimation", "position.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

      const carKeys = []; 

      carKeys.push({
          frame: 0,
          value: 35
      });

      carKeys.push({
          frame: 100,
          value: 0
      });

      carKeys.push({
          frame: 200,
          value: -25
      });

      animCar.setKeys(carKeys);

      const animCarUpDown = new BABYLON.Animation("animCarUpDown", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

      const carUpDownKeys = []; 

      carUpDownKeys.push({
          frame: 0,
          value: 1
      });

      carUpDownKeys.push({
          frame: 30,
          value: 0
      });

      carUpDownKeys.push({
          frame: 200,
          value: 0
      });

      animCarUpDown.setKeys(carUpDownKeys);

      newMeshesData[0].animations = [];
      newMeshesData[0].animations.push(animCar);
      newMeshesData[0].animations.push(animCarUpDown);
      // newMeshesData[0].animations.push(animCarX);
      // newMeshesData[0].animations.push(animCarRotate);

      carAnimation = scene.beginDirectAnimation(newMeshesData[0],[animCar, animCarUpDown], 0, 200, true);
      intervalID = setInterval(() => { wheelAnimation() }, 100)
      wheelAnimation()

    }

    const showOptBtns = function (value) {
      hoverVisible.value = value
    }

    const hideHover = function () {
      hoverVisible.value = 0
    }

    const controlLights = function () {
      isLighted.value = !isLighted.value
      newMeshesData.forEach((mesh) => {
        if (mesh.id.includes('headlight_cover') && isLighted.value && !mesh._children?.length) {
          // mesh.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
          // mesh.material.wireframe = true;
          // 左右、上下、前后
          light1.intensity = 1;
          light2.intensity = 1;
          light1.parent = mesh
          light2.parent = mesh
        } else if (mesh.id.includes('headlight_cover')) {
          /*mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
          mesh.material.wireframe = false;*/
          light1.intensity = isLighted.value ? 1 : 0
          light2.intensity = isLighted.value ? 1 : 0
          // light1.setEnabled(isLighted.value) // 背景闪烁
          // light2.setEnabled(isLighted.value)
        }
      })
    }

    const changeView = function (type) {
      drivingAnimation(true)
      carAnimation = null
      animateCount.value = 0
      switch (type) {
        case 1:
          camera = new BABYLON.ArcRotateCamera("camera", 0.8, 1.2, 5, new BABYLON.Vector3(0, 0, 0));
          camera.upperBetaLimit = Math.PI / 2.5; // 不能到地板以下
          camera.upperRadiusLimit = 40; // 最远范围
          camera.lowerRadiusLimit = 2.5; // 最近范围
          camera.minZ = -0.5; // 渲染范围
          camera.target = new BABYLON.Vector3(0, 0, -2.5) // 重置旋转中心点
          camera.attachControl(canvas, true);
          scene.activeCamera = camera

          if (newMeshesData[0]) {
            newMeshesData[0].scaling = new BABYLON.Vector3(-1, 1, -1);
            camera.parent = newMeshesData[0]
            camera.ignoreParentScaling = true
            newMeshesData[0].position = new BABYLON.Vector3(0, 0, 0)
          }
          break; 
        case 2:
          // 车内视角
          const innerCameraMain = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/2.1, 0.3, new BABYLON.Vector3(0.3, 1, -2.3));
          innerCameraMain.upperRadiusLimit = 0; // 最远范围
          innerCameraMain.lowerRadiusLimit = 0; // 最近范围
          innerCameraMain.minZ = -0.5; // 渲染范围
          innerCameraMain.attachControl(canvas, true);
          scene.activeCamera = innerCameraMain

          innerCameraMain.parent = newMeshesData[0] // 相机跟随
          innerCameraMain.ignoreParentScaling = true // 忽略模型的scaling
          newMeshesData[0].position = new BABYLON.Vector3(0, 0, 0) // 每次模型都回到初始位置

          break;
        case 3:
          const innerCameraRight = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/2.1, 0.3, new BABYLON.Vector3(-0.3, 1, -2.3));
          innerCameraRight.upperRadiusLimit = 0; // 最远范围
          innerCameraRight.lowerRadiusLimit = 0; // 最近范围
          innerCameraRight.minZ = -0.5; // 渲染范围
          innerCameraRight.attachControl(canvas, true);
          scene.activeCamera = innerCameraRight

          innerCameraRight.parent = newMeshesData[0] // 相机跟随
          innerCameraRight.ignoreParentScaling = true
          newMeshesData[0].position = new BABYLON.Vector3(0, 0, 0)
          break;
      }
    }

    window.clickBtn = clickBtn
    window.controlLights = controlLights

    return {
      visible,
      clickBtn,
      changeCarColor,
      showOptBtns,
      hideHover,
      hoverVisible,
      controlLights,
      changeView,
      drivingAnimation,
      initGround,
      animateCount
    }
  },
})
</script>

<style lang='stylus' scoped>
.page
  background #fff
  // margin-left 70px
  position relative
.App {
    width: 100%;
    height: 100%;
    text-align: center
}

.toolbar {
  position absolute;
  left 20px
  bottom 50px
  .opt_btn {
    display block
    margin-bottom 5px
  }
}
.change_colors {
  position relative
  .colors_div {
    display flex
    position absolute
    // left 130px
    left 5rem
    top 0
    button {
      display inline-block
      // width 5rem
      // width 120px
      margin 0
      margin-left 5px
    }
  }
}

body {
    margin: 0;
    padding: 0;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale
}

code {
    font-family: source-code-pro,Menlo,Monaco,Consolas,"Courier New",monospace
}

button {
  font-size 0.8rem
  padding 0.5rem
  user-select none
}

.container {
    display: flex
}

.canvas,.container,.root {
    width: 100%;
    height: 100%
}

.canvas {
    flex: 1 1;
    display: block;
    max-width: 100%
}

#renderCanvas {
  width: 100vw;
  height: 100vh;
}

.ant-tabs .ant-tabs-left-bar,.ant-tabs .ant-tabs-right-bar {
    height: 95%;
    border-bottom: 0;
    background: #e9e3dc;
    display: flex;
    align-items: self-start;
    text-align: center
}

.ant-tabs .ant-tabs-left-bar .ant-tabs-tab,.ant-tabs .ant-tabs-right-bar .ant-tabs-tab {
    display: block;
    float: none;
    margin: 0 0 11px;
    padding: 8px 20px!important;
    height: 50px
}

.ant-tabs-nav-container {
    position: relative;
    box-sizing: border-box;
    margin-bottom: -1px;
    overflow: hidden;
    font-size: 17px!important;
    line-height: 1.5715;
    white-space: nowrap;
    transition: padding .3s cubic-bezier(.645,.045,.355,1)
}

.ant-tabs-ink-bar {
    position: absolute;
    bottom: 1px;
    left: 0;
    z-index: 1;
    box-sizing: border-box;
    width: 0;
    height: 2px;
    transform-origin: 0 0
}

.ant-tabs-nav .ant-tabs-tab-active {
    color: #374abd!important;
    font-weight: 500
}

.ant-tabs .ant-tabs-left-content {
    padding-left: 5px!important;
    border-left: 1px solid #f0f0f0
}

.ant-tabs-nav .ant-tabs-tab:hover {
    color: #374abd!important
}

.ant-tabs-ink-bar {
    background-color: #374abd!important
}

.ant-tabs-nav .ant-tabs-tab {
    color: #464646
}

.ant-btn:focus,.ant-btn:hover {
    color: #e71e23!important;
    background-color: #fff!important;
    border-color: #e71e23!important
}

.ant-btn {
    border-color: #bbb!important;
    color: #3c3c3c!important
}

.ant-btn,.ant-btn-primary {
    background-color: #fff!important
}

.ant-btn-primary {
    color: #000!important;
    border-color: #8a8a8a!important;
    text-shadow: 0 -1px 0 rgba(0,0,0,.12);
    box-shadow: 0 2px 0 rgba(0,0,0,.045)
}

.ant-col-24.ant-form-item-label>label,.ant-col-xl-24.ant-form-item-label>label,.ant-form-vertical .ant-form-item-label>label {
    color: #e21a21
}

.ant-radio-button-wrapper {
    border: 1px solid #bbb!important;
    color: #000!important
}

.ant-radio-button-wrapper:hover {
    position: relative;
    color: #000!important;
    border-color: #374abd!important
}

.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):first-child {
    border-color: #374abd!important;
    color: #fff!important;
    background-color: #374abd!important;
    opacity: .8!important
}

.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    z-index: 1;
    color: #fff!important;
    background: #374abd!important;
    border-color: #374abd!important;
    opacity: .8!important
}

.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):before {
    background-color: #374abd!important;
    color: #fff!important;
    opacity: .8!important
}

.ant-layout-header {
    height: 8VH!important;
    padding: 0 50px;
    color: rgba(0,0,0,.65);
    line-height: 8VH!important;
    background: #2f3fa0!important
}

.ant-modal-body {
    max-height: 60vh!important;
    overflow: auto!important
}

::-webkit-scrollbar {
    width: 10px
}

::-webkit-scrollbar-track {
    background: #f1f1f1
}

::-webkit-scrollbar-thumb {
    background: #888
}

::-webkit-scrollbar-thumb:hover {
    background: #555
}

.ant-tabs-tab {
    text-align: center
}

.ant-tabs-nav {
    width: 100%!important
}

.ant-tabs-nav .ant-tabs-tab {
    width: 48%!important;
    margin: 0 2% 0 0!important
}

.selectedStyleButton {
    border-color: #374abd!important
}

.unSelectedStyleButton {
    border-color: #bbb!important
}

.ant-checkbox-group-item {
    display: block!important;
    margin-right: 0!important
}

</style>