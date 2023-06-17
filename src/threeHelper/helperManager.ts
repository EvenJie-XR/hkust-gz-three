import Stats from 'three/examples/jsm/libs/stats.module';
import { EventManager, EventType } from './eventManager';

export class HelperManager {
    constructor(private container:HTMLDivElement, private eventManager: EventManager) {

    }
    /**
     * 添加性能监测面板
     */
    addStats(): Stats {
        const stats = new (Stats as any)();
        this.container.appendChild( stats.dom );

        this.eventManager.addEventListener(() => {
            stats.update();
        }, EventType.TICK);
        return stats;
    }
}