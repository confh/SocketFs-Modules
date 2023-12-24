import websocket
import rel
import json

class SocketFs:
    def _on_message(self, ws, message):
        data = json.loads(message)
        for eventHandler in self._event_handlers:
            if eventHandler["name"] == data["name"]:
                eventHandler["callback"](data["data"])
    
    def __init__(self, url: str, on_open: any = None, on_error: any = None, on_close: any = None) -> None:
        self.url = url
        self._event_handlers = []
        self.ws = websocket.WebSocketApp(url, on_message=self._on_message, on_open = on_open, on_error = on_error, on_close = on_close)
        
    def send(self, eventName: str, data: any = None):
        """ Send data to the socket server """
        self.ws.send(json.dumps({"eventName": eventName, "data": data}))
        
    @property
    def on(self):
        """ Register event """
        def wrapper(func):
            self._event_handlers.append({"name": func.__name__, "callback": func})
            return func
        return wrapper
        
    def run(self, reconnect=5):
        """ Run the socket client """
        self.ws.run_forever(reconnect=reconnect, dispatcher=rel)
        rel.signal(2, rel.abort)
        rel.dispatch()