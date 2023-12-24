
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
### TypeScript client example

```ts
import { SocketFsClient } from "./socketfs_client";

const socket = new SocketFsClient("ws://localhost:8080")
socket.on("connected", () => {
    console.log("Connected")
    socket.emit("hi", "OKK!")
})
socket.on("ping", (data: any) => console.log(data))


socket.connect()
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
### C# client example
```cs
using Newtonsoft.Json.Linq;
using System;
using System.Threading.Tasks;
namespace SocketFs
{
    class Program
    {
        static async Task Main(string[] args)
        {
            SocketFs sf = new SocketFs("ws://localhost:8080");
            sf.debug = true;
            sf.on("connected", (data) =>
            {
                Console.WriteLine("Connected!!");
                sf.emit("hi", new JObject { { "eventName", "s" } });
            });
            await sf.connectAndRun();
        }
    }
}
```
