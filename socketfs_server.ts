import WebSocket from 'ws';

export interface SocketInterface {
    on: Function,
    send: Function,
    id: string
}

interface eventCallback {
    eventName: string,
    callback: Function
}

interface socketData {
    eventName: string,
    data?: any
}

export class SocketFs {
    private ws: WebSocket.Server
    private eventHandlers: eventCallback[] = []
    private socketEventHandlers: eventCallback[] = []
    public clients: Set<WebSocket>

    /**
     * Run the socket server
     * @param port Port to connect to
     */
    connect(port = 8080) {
        this.ws = new WebSocket.Server({ port });
        this.ws.on("connection", (ws: SocketInterface) => {
            ws.id = this.getUniqueID()
            this.clients = this.ws.clients
            ws.on("message", (message: string) => {
                const data: socketData = JSON.parse(message)
                for (let i = 0; i < this.socketEventHandlers.length; i++) {
                    const event = this.socketEventHandlers[i]
                    if (event.eventName === data.eventName) {
                        event.callback(data.data)
                        break
                    }
                }
            })
            this.emit("connected", ws)
        })
        this.ws.on("close", (ws: SocketInterface) => {
            this.clients = this.ws.clients
            this.emit("disconnected", ws)
        })
    }

    on(eventName: string, callback: Function) {
        this.eventHandlers.push({ eventName, callback })
    }

    onSocketEvent(ws: SocketInterface, eventName: string, callback: Function) {
        this.socketEventHandlers.push({ eventName, callback })
    }

    emit(eventName: string, ...args: any[]) {
        for (let i = 0; i < this.eventHandlers.length; i++) {
            const event = this.eventHandlers[i]
            if (event.eventName === eventName) {
                event.callback(...args)
                break
            }
        }
    }

    /**
     * Send data to all clients.
     * @param eventName Name of the event
     * @param args Arguments to send data with
     */
    broadcast(eventName: string, data: any) {
        this.ws.clients.forEach((client: any) => {
            if (client !== this.ws && client.readyState === WebSocket.OPEN) {
                client.send(this.stringifySendData(eventName, data))
            }
        })
    }

    /**
     * Converts send data into stringified json
     * @param eventName Name of the event.
     * @param args Arguments to send with data
     * @returns Stringified JSON
     */

    stringifySendData(eventName: string, data: any): string {
        return JSON.stringify({ name: eventName, data })
    }

    private getUniqueID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    };
}
