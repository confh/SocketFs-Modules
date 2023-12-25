package com.socket.fs;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONObject;

interface Callback {
    public void callback(Object data);
}

class EventHandler {
    public String eventName;
    public Callback callback;

    public EventHandler(String eventName, Callback callback) {
        this.eventName = eventName;
        this.callback = callback;
    }
}

public class SocketFs extends WebSocketClient {
    private List<EventHandler> eventHandlers = new ArrayList<EventHandler>();
    private boolean debug = false;

    public SocketFs(URI serverUri, Draft draft) {
        super(serverUri, draft);
    }

    public SocketFs(URI serverURI) {
        super(serverURI);
    }

    public SocketFs(URI serverUri, Map<String, String> httpHeaders) {
        super(serverUri, httpHeaders);
    }

    public void on(String eventName, Callback callback) {
        eventHandlers.add(new EventHandler(eventName, callback));
    }

    private void _emitEvent(String eventName, Object... data) {
        EventHandler[] array = new EventHandler[eventHandlers.size()];
        eventHandlers.toArray(array);
        for (EventHandler eventHandler : array) {
            if (eventHandler.eventName.equals(eventName)) {
                try {
                    eventHandler.callback.callback(data.length > 0 ? data[0] : null);
                } catch (Exception e) {
                }
            }
        }
    }

    @Override
    public void onOpen(ServerHandshake handshakedata) {
        if(debug) {
            System.out.println("opened connection");
        }
        _emitEvent("connected");
    }

    @Override
    public void onMessage(String message) {
        JSONObject json = new JSONObject(message);
        String eventName = json.getString("eventName");
        Object data = json.get("data");
        _emitEvent(eventName, data);
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        // The close codes are documented in class org.java_websocket.framing.CloseFrame
        System.out.println(
                "Connection closed by " + (remote ? "remote peer" : "us") + " Code: " + code + " Reason: "
                        + reason);
    }

    @Override
    public void onError(Exception ex) {
        ex.printStackTrace();
        // if the error is fatal then onClose will be called additionally
    }
}
