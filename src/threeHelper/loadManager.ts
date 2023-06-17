import * as THREE from 'three'
import { Loader3DTiles } from 'three-loader-3dtiles';
import { EventManager, EventType } from './eventManager';


export class LoadManager{
    constructor(private renderer: THREE.WebGLRenderer, private scene: THREE.Scene, private camera: THREE.PerspectiveCamera, private evenetManager: EventManager) {
        
    }
    async loadTileset(url: string) {
        const clock = new THREE.Clock();
        const result = await Loader3DTiles.load(
            {
                url,
                renderer: this.renderer,
                options: {
                  dracoDecoderPath: '/libs/draco',
                  basisTranscoderPath: '/libs/basis',
                }
            }
        )
        const {model, runtime} = result;
        const tilesRuntime = runtime;
        this.scene.add(model);
        this.evenetManager.addEventListener(() => {
            const dt = clock.getDelta()
            if (tilesRuntime) {
                tilesRuntime.update(dt, this.renderer, this.camera);
            }
        }, EventType.TICK);
    }
}