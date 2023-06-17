import * as THREE from "three"
import { EventManager } from "./eventManager"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { LoadManager } from "./loadManager";
import { HelperManager } from "./helperManager";
import { withBase } from "../utils/pathUtils";

export class ThreeHelper {
    public camera: THREE.PerspectiveCamera;
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public eventManager: EventManager;
    public controls: OrbitControls
    public loadManager: LoadManager
    public helperManager: HelperManager
    constructor(public container: HTMLDivElement) {
        // 初始化camera
        this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 10000);
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.camera.position.set(0, 0, 10);

        // 初始化scene
        this.scene = new THREE.Scene();

        // 初始化renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);

        // 初始化controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // @ts-ignore
        this.controls.listenToKeyEvents(window); // optional
        this.controls.enableDamping = true;
        this.controls.screenSpacePanning = false;
        this.controls.update();


        // 监听container尺寸变化
        window.addEventListener("resize", this.onContainerResize.bind(this));

        // 初始化managers
        this.eventManager = new EventManager();
        this.loadManager = new LoadManager(this.renderer, this.scene, this.camera, this.eventManager);
        this.helperManager = new HelperManager(this.container, this.eventManager);

        // 初始化场景内容
        this.initScene();

        // 开始渲染
        this.renderer.render(this.scene, this.camera);
        this.tick();
    }
    /**
     * 每一帧渲染函数
     */
    private tick() {
        requestAnimationFrame(this.tick.bind(this));
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
        this.eventManager.executeTickEventCallBack();
    }
    /**
     * 处理container尺寸变化
     */
    private onContainerResize() {
        // 设置相机尺寸比，防止渲染内容变形
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        /*
            渲染器执行render方法的时候会读取相机对象的投影矩阵属性projectionMatrix
            但是不会每渲染一帧，就通过相机的属性计算投影矩阵(节约计算资源)
            如果相机的一些属性发生了变化，需要执行updateProjectionMatrix ()方法更新相机的投影矩阵
        */
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    /**
     * 初始化场景内容
     */
    private initScene() {
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambientLight);

        // 添加天空盒
        this.scene.background = new THREE.CubeTextureLoader().setPath(withBase('/data/skybox/cube/'))
            .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']);
        this.helperManager.addStats();
    }
    private disposeNode(node: THREE.Object3D) {
        if (node instanceof THREE.Mesh) {
            if (node.geometry) {
                node.geometry.dispose();
            }

            if (node.material) {
                if (Array.isArray(node.material)) {
                    node.material.forEach((material) => {
                        if (material.map) material.map.dispose();
                        if (material.lightMap) material.lightMap.dispose();
                        if (material.bumpMap) material.bumpMap.dispose();
                        if (material.normalMap) material.normalMap.dispose();
                        if (material.specularMap) material.specularMap.dispose();
                        if (material.envMap) material.envMap.dispose();
                        material.dispose(); // disposes any programs associated with the material
                    });
                } else {
                    // @ts-ignore
                    if ((node.material as THREE.Material).map) (node.material as THREE.Material).map.dispose();
                    // @ts-ignore
                    if ((node.material as THREE.Material).lightMap) (node.material as THREE.Material).lightMap.dispose();
                    // @ts-ignore
                    if ((node.material as THREE.Material).bumpMap) (node.material as THREE.Material).bumpMap.dispose();
                    // @ts-ignore
                    if ((node.material as THREE.Material).normalMap) (node.material as THREE.Material).normalMap.dispose();
                    // @ts-ignore
                    if ((node.material as THREE.Material).specularMap) (node.material as THREE.Material).specularMap.dispose();
                    // @ts-ignore
                    if ((node.material as THREE.Material).envMap) (node.material as THREE.Material).envMap.dispose();
                    (node.material as THREE.Material).dispose(); // disposes any programs associated with the material
                }
            }
        }
    }
    private disposeHierarchy(node: THREE.Object3D, callback: (node: THREE.Object3D) => void) {
        for (let i = node.children.length - 1; i >= 0; i--) {
            let child = node.children[i];
            this.disposeHierarchy(child, callback);
            callback(child);
        }
    }
    /**
     * 释放scene内容
     * @param scene 
     */
    private disposeScene(scene: THREE.Scene) {
        this.disposeHierarchy(scene, this.disposeNode);
    }
    /**
     * 释放threejs占用的内存
     */
    dispose() {
        // 释放scene内容
        this.disposeScene(this.scene);
        // 释放controls
        this.controls.dispose();
        // 释放renderer
        this.renderer.dispose();
    }
}