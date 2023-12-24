import WebSocket from 'ws';
import events from "events"

export interface SocketInterface {
    on: Function,
    send: Function,
    id: string
}

export class SocketFs extends events {
    private ws: WebSocket.Server

    connect(port = 8080) {
        this.ws = new WebSocket.Server({ port });
        this.ws.on("connection", (ws: any) => {
            ws.id = this.getUniqueID()
            this.emit("connection", ws)
        })
    }

    broadcast(eventName: string, ...args: any[]) {
        this.ws.clients.forEach(client => {
            client.send(JSON.stringify({ name: eventName, data: args }))
        })
    }

    getUniqueID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    };
}
