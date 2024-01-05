
<template>
  <div class="page">
    <div class="btn_group">
      <div class="btn" @click='changeCarColor(1)'>灰色</div>
      <div class="btn" @click='changeCarColor(2)'>绿色</div>
      <div class="btn" @click='changeCarColor(3)'>黑色</div>
      <div class="btn" @click='changeTires()'>轮胎</div>
      <div class="btn" @click='changeTires(1)'>轮胎1</div>
      <div class="btn" @click='changeTires(2)'>轮胎2</div>
      <div class="btn" @click='changeTires(3)'>轮胎3</div>
      <div class="btn" @click='lightAnimate'>灯光</div>
    </div>
      
    <canvas id="renderCanvas" touch-action="none"></canvas>
  </div>
</template>
<script>
import { defineComponent, onMounted, ref } from 'vue'
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import * as GUI from '@babylonjs/gui/2D';
export default defineComponent({
  name: 'car3d',
  setup () {
    let scene = null
    let camera = null
    let canvas = null
    let light = null
    let light2 = null
    let lightbl = null
    let lightbr = null
    let animations = []
    let newMeshesData = []
    const allLights = {}
    const originalMaterial = {}
    const initLightIntersity = [2, 2.5]
    const positionY = -0.6
    const isLighted = ref(true)
    const interval = ref(null)
    const count = ref(0)

    const selfColor = {
      1: new BABYLON.Color4(0.61, 0.62, 0.65, .6),
      2: new BABYLON.Color4(0.02, 0.2, 0.16, .6),
      3: new BABYLON.Color4(0.1, 0.1, 0.11, .1)
    }

    const tiresIds = [
      "Object_88",
      "Object_111",
    ]

    const bodyIds = [
      "Object_4",
      "Object_7",
      // "Object_9",
      // "Object_15",
      "Object_31",
      "Object_33",
      "Object_40",
      // "Object_44",
      "Object_46",
      "Object_47",
      // "Object_50",
      "Object_52",
      "Object_54",
      // "Object_56",
      "Object_60",
      "Object_62",
      "Object_66",
      // "Object_78",
      "Object_107",

    ]

    onMounted(() => {

      canvas = document.getElementById("renderCanvas"); // Get the canvas element
      const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

      scene = new BABYLON.Scene(engine);
      scene.useRightHandedSystem = true;
      scene.clearColor = new BABYLON.Color3(0, 0, 0);
      // scene.clearColor = new BABYLON.Color3(255, 255, 255);

      // 监听点击
      scene.onPointerObservable.add((pointerInfo) => {            
        switch (pointerInfo.type) {
          case BABYLON.PointerEventTypes.POINTERDOWN:
            if(pointerInfo.pickInfo.hit) {
              pointerDown(pointerInfo.pickInfo.pickedMesh)
            }
          break;
        }
      });
      
      // camera
      changeView(1)

      // Register a render loop to repeatedly render the scene
      engine.runRenderLoop(function () {
        scene.render();
        // if(camera) camera.alpha += 0.005;
      });

      //初始化光线
      // const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.3, 2, -2), scene);
      // light.specular = new BABYLON.Color3(1, 0.98, 0.94);
      light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.5, 6, -2), scene);
      light.intensity = initLightIntersity[0];

      light2 = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(1, -6, -2), scene);
      light2.intensity = initLightIntersity[1]

      //初始化光线

      // allLights.light1 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(2, -1, 1), scene); // 左

      allLights.light2 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-2, -1, 1), scene); // 右

      // allLights.light3 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 3), scene); // 后

      // allLights.light3 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-2, -2, 3), scene); // 右后

      // allLights.light4 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(3, -2, 4), scene); // 左后

      // allLights.light5 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(2, -1, -2), scene); // 左前

      // allLights.light6 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-2, -1, 2), scene); // 右前

      // allLights.light7 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0.3, 0, -2), scene); // 前

      // allLights.light8 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-1.5, 0, -1), scene); // 右前侧

      // allLights.light9 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(3, 0, 2), scene); // 左侧

      // allLights.light10 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(2, -1, 4), scene); // 左后侧

      // allLights.light11 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(3, 0, -1), scene); // 右前侧


      // var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 2, scene);
      // lightSphere.position = light2.position;
      // lightSphere.material = new BABYLON.StandardMaterial("light", scene);
      // lightSphere.material.emissiveColor = new BABYLON.Color3(1, 2, 0);

      for(let key in allLights) {
        allLights[key].intensity = 0
      }

      var ground = BABYLON.Mesh.CreateGround("ground", 6, 6, 2, scene);
      ground.receiveShadows = true;
      ground.position.y = positionY
      ground.emissiveColor = BABYLON.Color3.Black();
      
      // Create and tweak the background material.
      var backgroundMaterial = new BABYLON.BackgroundMaterial("backgroundMaterial", scene);
      backgroundMaterial.diffuseTexture = new BABYLON.Texture("https://app-common.ks3-cn-beijing.ksyun.com/3D_car/底部background-24c6a4a84dd5a0831ae06de9890358c8.png", scene);
      backgroundMaterial.diffuseTexture.hasAlpha = true;
      backgroundMaterial.opacityFresnel = false;
      backgroundMaterial.shadowLevel = 1;
      backgroundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      backgroundMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);

      ground.material = backgroundMaterial;      

      BABYLON.SceneLoader.ImportMesh("", "", "https://app-common.ks3-cn-beijing.ksyun.com/3d/car-8260230b38d49c38fa3dfffdb6f7ccd5.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {

        newMeshes.forEach((mesh) => {
          if (tiresIds.includes(mesh.id) || bodyIds.includes(mesh.id)) {
            originalMaterial[mesh.id] = mesh.material
          }
        })

        // 给客户端发送消息
        const params = {
          code: 0,
          message: 'Loading completed'
        }
        window.NativeAppCar?.postMessage(JSON.stringify(params))

        animationGroups.forEach(group => {
          animations.push(group)
          group.stop();
          // group.reset();
        });

        newMeshesData = newMeshes

        newMeshesData[0].position = new BABYLON.Vector3(0, positionY, 0)
        controlLights()
      });

    })

    const pointerDown = (mesh) => {
      console.log('mesh:', mesh)
    }

    const lightAnimate = function () {
      interval.value && clearInterval(interval.value)
      interval.value = setInterval(() => {
        if (count.value < 4) {
          count.value += 1
          controlLights()
        } else {
          interval.value && clearInterval(interval.value)
          count.value = 0
        }
      }, 700)
    }

    const controlLights = function () {
      isLighted.value = !isLighted.value
      newMeshesData.forEach((mesh) => {
        if (mesh.id === "Object_29" && !isLighted.value) {
          !originalMaterial[mesh.id] && (originalMaterial[mesh.id] = mesh.material)
          const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
          // myMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
          // myMaterial.diffuseTexture = new BABYLON.Texture('/src/assets/image/gray-carcolor.png', scene);
          myMaterial.alpha = 0;
          mesh.material = myMaterial
        } else if (mesh.id === "Object_29") {
          const temp = originalMaterial[mesh.id]
          // temp.maxSimultaneousLights = 5
          temp.alpha = 0.5
          mesh.material = temp
        }
      })
    }

    const changeTires = function (data) {
      
      if (!data) {
        newMeshesData.forEach((mesh) => {
          if (tiresIds.includes(mesh.id)) {
            mesh.material = originalMaterial[mesh.id];
          }
        })
      } else {
        // const urlList = {
        //   1: '/src/assets/image/gray-carcolor.png',
        //   2: '/src/assets/image/green-carcolor.png',
        //   3: '/src/assets/image/black-carcolor.png',
        // }
        // const url = urlList[data]
        const url = selfColor[data] || data
        const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
        // myMaterial.diffuseTexture = new BABYLON.Texture(url, scene);
        // myMaterial.diffuseTexture.uScale = 1;
        // myMaterial.diffuseTexture.vScale = 1;
        myMaterial.diffuseColor = url

        newMeshesData.forEach((mesh,index) => {
          if (tiresIds.includes(mesh.id)) {
            mesh.material = myMaterial;
          }
        })
        // const img = new Image();
        // img.src = url;
        // img.onload = function() {
        //   myMaterial.diffuseTexture = new BABYLON.Texture(url, scene);
        //   // myMaterial.diffuseColor = new BABYLON.Color3(0.61, 0.62, 0.65)
        //   newMeshesData.forEach((mesh,index) => {
        //     if (tiresIds.includes(mesh.id)) {
        //       mesh.material = myMaterial;
        //     }
        //   })
        // }
      }
    }

    const changeCarColor = function (data) {
      const myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
      // const img = new Image();
      // const selfUrl = {
      //   1: '/src/assets/image/gray-carcolor.png',
      //   2: '/src/assets/image/green-carcolor.png',
      //   3: '/src/assets/image/black-carcolor.png'
      // }
      let url = selfColor[data] || data
      // let url = selfUrl[data] || data
      // img.src = url;
      // myMaterial.diffuseTexture = new BABYLON.Texture(url, scene);

      // 控制灯光
      for(let key in allLights) {
        allLights[key].intensity = data === 3 ? 0 : 0.7
      }
      if (data === 1) {
        light.intensity = 0.5
        light2.intensity = 0.6
      } else if (data === 2) {
        light.intensity = 0.8
        light2.intensity = 1
      } else {
        light.intensity = initLightIntersity[0]
        light2.intensity = initLightIntersity[1]
      }

      // 修改材质
      newMeshesData.forEach((mesh,index) => {
        if (bodyIds.includes(mesh.id) && data === 3 && originalMaterial[mesh.id]) {
          mesh.material = originalMaterial[mesh.id]
        } else if (bodyIds.includes(mesh.id)) {
          myMaterial.diffuseColor = url
          // myMaterial.specularColor = url
          myMaterial.ambientColor = url
          // myMaterial.emissiveColor = url
          mesh.material = myMaterial;
        }
      })
      // img.onload = function () {
      //   newMeshesData.forEach((mesh,index) => {
      //     if (bodyIds.includes(mesh.id) && data === 3 && originalMaterial[mesh.id]) {
      //       mesh.material = originalMaterial[mesh.id]
      //     } else if (bodyIds.includes(mesh.id)) {
      //       // myMaterial.diffuseColor = selfColor[data]
      //       // myMaterial.specularColor = selfColor[data]
      //       // myMaterial.ambientColor = selfColor[data]
      //       mesh.material = myMaterial;
      //     }
      //   })
      // }
    }

    const changeView = function (type) {
      switch (type) {
        case 1:
          camera = new BABYLON.ArcRotateCamera("camera", 0.9, 1.5, 5, new BABYLON.Vector3(0, 0, 0));
          camera.upperBetaLimit = Math.PI / 2.2; // 不能到地板以下
          camera.upperRadiusLimit = camera.radius; // 最远范围
          camera.lowerRadiusLimit = camera.radius; // 最近范围
          camera.minZ = -0.5; // 渲染范围
          camera.target = new BABYLON.Vector3(0, 0, -0.1) // 重置旋转中心点
          camera.attachControl(canvas, true);
          scene.activeCamera = camera
          break; 
        case 2:
          // 车内视角
          const innerCameraMain = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/2.1, 0.3, new BABYLON.Vector3(0, 1, -0.5));
          innerCameraMain.upperRadiusLimit = 0; // 最远范围
          innerCameraMain.lowerRadiusLimit = 0; // 最近范围
          innerCameraMain.minZ = -0.5; // 渲染范围
          innerCameraMain.attachControl(canvas, true);
          scene.activeCamera = innerCameraMain

          innerCameraMain.parent = newMeshesData[0] // 相机跟随
          innerCameraMain.ignoreParentScaling = true // 忽略模型的scaling
          // newMeshesData[0].position = new BABYLON.Vector3(0, 0, 0) // 每次模型都回到初始位置

          break;
        case 3:
          // 侧面视角
          camera = new BABYLON.ArcRotateCamera("camera", 0.8, 1.3, 5, new BABYLON.Vector3(0, 0, 0));
          camera.upperBetaLimit = Math.PI / 2.3; // 不能到地板以下
          camera.upperRadiusLimit = 10; // 最远范围
          camera.lowerRadiusLimit = 2.5; // 最近范围
          camera.minZ = -0.5; // 渲染范围
          camera.target = new BABYLON.Vector3(0, 0, 0) // 重置旋转中心点
          camera.attachControl(canvas, true);
          scene.activeCamera = camera

          // newMeshesData[0].rotation.y = Math.PI/4 // 正面
          newMeshesData[0].rotation.y = -Math.PI/3 // 侧面
          break; 
      }
    }

    window.changeCarColor = changeCarColor
    window.changeTires = changeTires
    window.lightAnimate = lightAnimate

    return {
      changeView,
      changeTires,
      lightAnimate,
      changeCarColor
    }
  },
})
</script>

<style lang='stylus' scoped>
.page {
  position: relative
}
#renderCanvas {
  width: 100vw;
  height: calc(1.07 * 100vw);
}
.btn_group {
  z-index: 2;
  position: absolute
  right: 30px;
  top: 450px;
  // width: 300px;
  // height: 100px
  display: flex
  flex-direction column
}
.btn {
  display: block;
  width: 120px
  line-height: 30px
  background #fff
  color #000
  &:hover {
    cursor: pointer
  }
}

</style>