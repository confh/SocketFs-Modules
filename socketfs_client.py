import websocket
import rel
import json

class SocketFs:
    def _on_message(self, ws, message):
        data = json.loads(message)
        for eventHandler in self._event_handlers:
            if eventHandler.name == data.name:
                eventHandler.callback(data.data[0])
    
    def __init__(self, url: str, on_open: any = None, on_error: any = None, on_close: any = None) -> None:
        self.url = url
        self._event_handlers = []
        self.on_open = on_open
        self.on_error = on_error
        self.on_close = on_close
        self.ws = websocket.WebSocketApp(url, on_message=self._on_message, on_open = on_open, on_error = on_error, on_close = on_close)
        
    def on(self, name: str, callback: any):
        self._event_handlers.append({"name": name, "callback": callback})
        
    def run(self, reconnect=5):
        self.ws.run_forever(reconnect=reconnect)
        rel.signal(2, rel.abort)
        rel.dispatch()
        
    def enableTrace(enable: bool):
        websocket.enableTrace(enable)