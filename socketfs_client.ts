import { client as WebsocketClient, connection } from "websocket";

interface EventHandler {
    eventName: string,
    callback: Function
}

interface MessageData {
    eventName: string,
    data: any
}

export class SocketFsClient {
    private ws = new WebsocketClient()
    private url: string
    private eventHandlers: EventHandler[] = []
    private connection: connection

    constructor(url: string) {
        this.url = url
    }

    /**
     * Connect to the socket server
     */
    async connect() {
        await this.ws.connect(this.url)
        this.ws.removeAllListeners()
        this.ws.on("connect", connection => {
            this.emitEvent("connected")

            connection.on("close", () => {
                setTimeout(() => {
                    this.connect()
                }, 1000);
            })

            connection.on("error", () => {
                connection.close()
            })

            connection.on("message", (message) => {
                if (message.type === 'utf8') {
                    const data = JSON.parse(message.utf8Data) as MessageData
                    console.log(data)
                    this.emitEvent(data.eventName, data.data)
                }

            })
            this.connection = connection
        })
        this.ws.on("connectFailed", () => setTimeout(() => {
            this.connect()
        }, 1000))
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
        this.connection.send(this.stringifySendData(eventName, data))
    }

    /**
     * Converts send data into stringified json
     * @param eventName Name of the event.
     * @param args Arguments to send with data
     * @returns Stringified JSON
     */

    private stringifySendData(eventName: string, data: any): string {
        return JSON.stringify({ name: eventName, data })
    }
}