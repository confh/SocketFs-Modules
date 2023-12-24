import WebSocket = require("ws");

interface EventHandler {
    eventName: string,
    callback: Function
}

interface MessageData {
    eventName: string,
    data: any
}

export class SocketFsClient {
    private ws: WebSocket
    private url: string
    private eventHandlers: EventHandler[] = []

    constructor(url: string) {
        this.url = url
    }

    /**
     * Connect to the socket server
     */
    async connect() {
        this.ws = new WebSocket(this.url)
        this.ws.on("error", () => {
            this.ws.close()
        })
        this.ws.on("close", () => {
            setTimeout(() => {
                this.connect()
            }, 1000);
        })
        this.ws.on("open", () => {
            this.emitEvent("connected")
        })
        this.ws.on("message", (message) => {
            const data = JSON.parse(message.toString()) as MessageData
            console.log(data)
            this.emitEvent(data.eventName, data.data)
        })
    }

    /**
     * Register event
     * @param eventName Name of the event
     * @param callback Callback of the event
     */
    on(eventName: string, callback: Function) {
        this.eventHandlers.push({ eventName, callback })
    }

    private emitEvent(eventName: string, data?: any) {
        for (let i = 0; i < this.eventHandlers.length; i++) {
            const event = this.eventHandlers[i]
            if (event.eventName === eventName) {
                event.callback(data)
                break
            }
        }
    }

    /**
     * Send message to socket server
     * @param eventName Name of the event
     * @param data Data
     */
    emit(eventName: string, data: any) {
        this.ws.send(this.stringifySendData(eventName, data))
    }

    /**
     * Converts send data into stringified json
     * @param eventName Name of the event.
     * @param args Arguments to send with data
     * @returns Stringified JSON
     */

    private stringifySendData(eventName: string, data: any): string {
        return JSON.stringify({ eventName: eventName, data })
    }
}