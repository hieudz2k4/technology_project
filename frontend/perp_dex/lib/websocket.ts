import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://localhost:8081/ws'; // Adjust if backend URL differs

export const createStompClient = (onConnect: () => void, onError: (err: any) => void) => {
    const client = new Client({
        webSocketFactory: () => new SockJS(SOCKET_URL),
        onConnect: onConnect,
        onStompError: onError,
        // debug: (str) => {
        //     console.log(str);
        // },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    return client;
};
