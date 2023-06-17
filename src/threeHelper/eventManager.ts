export type removeEventListener = () => void;

export type EventList = {
    tick: (() => void)[]
}

export enum EventType {
    TICK = "tick"
}

/**
 * 用于管理jhree的一些事件
 */
export class EventManager {
    private eventList: EventList = {
        tick: [] as unknown as (() => void)[]
    }
    constructor() {
        
    }
    // 添加事件监听函数
    addEventListener(callback: () => void, eventType: EventType): removeEventListener {
        this.eventList[eventType].push(callback);
        return () => {
            this.eventList[eventType].splice(this.eventList[eventType].indexOf(callback), 1);
        }
    }
    /**
     * 执行tick的callback
     */
    executeTickEventCallBack() {
        this.eventList.tick.forEach((callback) => {
            callback();
        })
    }
}