using Newtonsoft.Json.Linq;
using System;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace SocketFs
{
    public delegate void Callback(Object data);
    internal class EventHandler
    {
        public virtual string eventName { get; set; }
        public virtual Callback callback { get; set; }
        public EventHandler(string eventName, Callback callback) { this.eventName = eventName; this.callback = callback; }
    }
    public class SocketFs
    {
        public ClientWebSocket socket;
        private Uri url;
        private EventHandler[] eventHandlers = new EventHandler[] { };
        public bool debug = false;
        public SocketFs(string url) { this.url = new Uri(url); }

        public async Task emit(string eventName, Object data = null)
        {
            JObject jsonData = new JObject
            {
                { "eventName", eventName },
                { "data", data.ToString() }
            };
            var bytes = new ArraySegment<byte>(Encoding.UTF8.GetBytes(jsonData.ToString()), 0, Encoding.UTF8.GetBytes(jsonData.ToString()).Length);
            await socket.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        public void on(string eventName, Callback callback)
        {
            eventHandlers = eventHandlers.Append(new EventHandler(eventName, callback)).ToArray();
        }

        private void emitEvent(string eventName, Object data = null)
        {
            for (int i = 0; i < eventHandlers.Length; i++)
            {
                var eventHandler = eventHandlers[i];

                if (eventHandler.eventName.Equals(eventName))
                {
                    eventHandler.callback(data);
                    break;
                }
            }
        }

        public async Task connectAndRun()
        {
            while (true)
            {
                try
                {
                    socket = new ClientWebSocket();
                    if (debug) Console.WriteLine("Connecting");
                    await socket.ConnectAsync(url, CancellationToken.None);
                    break;
                }
                catch
                {
                    if (debug) Console.WriteLine("Trying to reconnect");
                    Thread.Sleep(1000);
                }
            }
            if (debug) Console.WriteLine("Successfully connected to " + url.ToString());
            emitEvent("connected");
            while (true)
            {
                try
                {
                    ArraySegment<byte> byte_received = new ArraySegment<byte>(new byte[1024]);
                    var res = await socket.ReceiveAsync(byte_received, CancellationToken.None);
                    byte_received = new ArraySegment<byte>(byte_received.Array.Where(v => v > 0).ToArray());
                    if (res.MessageType == WebSocketMessageType.Text)
                    {
                        JObject json = JObject.Parse(Encoding.UTF8.GetString(byte_received.Array));
                        emitEvent(json["eventName"].ToString(), json["data"].ToString());
                    }
                }
                catch
                {
                    while (true)
                    {
                        try
                        {
                            socket = new ClientWebSocket();
                            if (debug) Console.WriteLine("Connecting");
                            await socket.ConnectAsync(url, CancellationToken.None);
                            if (debug) Console.WriteLine("Successfully connected to " + url.ToString());
                            emitEvent("connected");
                            break;
                        }
                        catch
                        {
                            if (debug) Console.WriteLine("Trying to reconnect");
                            Thread.Sleep(1000);
                        }
                    }
                }
            }
        }
    }
}
