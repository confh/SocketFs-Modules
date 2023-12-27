import 'dart:convert';
import 'dart:io';

import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter/material.dart';

class EventHandler {
  String eventName;
  Function callback;
  EventHandler(this.eventName, this.callback);
}

class EmitData {
  late final String eventName;
  late final dynamic data;

  EmitData(this.eventName, this.data);

  Map<String, dynamic> toJson() => {
        '"eventName"': '"$eventName"',
        '"data"': '"$data"',
      };
}

void showToast(String msg) {
  Fluttertoast.showToast(
      msg: msg,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.CENTER,
      timeInSecForIosWeb: 1,
      backgroundColor: Colors.red,
      textColor: Colors.white,
      fontSize: 16.0);
}

class SocketFs {
  late WebSocket socket;
  late Uri uri;
  List<EventHandler> eventHandlers = [];
  SocketFs(this.uri);

  on(String eventName, Function callback) {
    eventHandlers.add(EventHandler(eventName, callback));
  }

  // ignore: non_constant_identifier_names
  _emit_event(String eventName, dynamic data) {
    for (var eventHandler in eventHandlers) {
      if (eventHandler.eventName == eventName) eventHandler.callback(data);
    }
  }

  emit(String eventName, dynamic data) {
    socket.add(EmitData(eventName, data).toJson());
  }

  connect() async {
    showToast("Connecting");
    await WebSocket.connect(uri.origin).then((value) => socket = value);
    showToast("Connected");
    socket.listen((message) {
      final data = jsonDecode(message.toString());
      _emit_event(data['eventName'], data['data']);
    });
  }
}
