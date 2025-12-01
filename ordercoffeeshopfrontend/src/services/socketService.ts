import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// const SOCKET_URL = 'http://103.77.243.143/ws';
// Dùng ws:// thay cho http://
const SOCKET_URL = 'http://103.77.243.143/ws';

let stompClient: any = null;

export const connect = (topic: string, onMessageReceived: (message: any) => void) => {
  stompClient = Stomp.over(() => new SockJS(SOCKET_URL));
  stompClient.connect({}, () => {
    stompClient.subscribe(topic, (message: any) => {
      onMessageReceived(JSON.parse(message.body));
    });
  });
};

export const disconnect = () => {
  if (stompClient !== null) {
    stompClient.disconnect();
  }
};
