
# SocketFs

Easy-to-use-socket

### TypeScript server example

```ts
import { SocketFs, SocketInterface } from "./socketfs_server"

const socket = new SocketFs()
socket.connect()

socket.on('connected', (ws: SocketInterface) => {
    console.log('New client connected');
    console.log(`ID: ${ws.id}`)

    ws.send(socket.stringifySendData("ping", "pinged!"))

    socket.onSocketEvent(ws, "hello", (d: any) => {
        console.log(`${d}`)
        socket.broadcast("test", `Server received your message: ${d}`)
    })

    ws.on('close', () => {
        console.log('Client disconnected');
    })
});
```
### Python client example

```py
import websocket
import socketfs_client

def on_open(ws: websocket.WebSocketApp):
    print("Opened connection")
    

if __name__ == "__main__":
    ws = socketfs_client.SocketFs("ws://localhost:8080", on_open=on_open)
    @ws.on
    def ping(data):
        print(data)
        ws.send("hello")
    @ws.on
    def test(data):
        print(data)
    ws.run()
```
