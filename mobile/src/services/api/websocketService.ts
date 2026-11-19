/**
 * Real-Time WebSocket & STOMP Service for UPLINK Mobile.
 *
 * Provides a lightweight, rock-solid STOMP-over-WebSocket implementation
 * using React Native's native WebSocket engine.
 *
 * Features:
 * - STOMP 1.1 / 1.2 frame parsing & serialization
 * - Automatic authentication with Bearer JWT token
 * - Automatic reconnection with exponential backoff & jitter
 * - Automatic subscription re-registration on reconnect
 * - Connection state listeners (connected, disconnected, reconnecting)
 * - Heartbeat keep-alives (ping/pong)
 */

import { ENV } from '../../config/env';
import { tokenStorage } from './tokenStorage';

export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING';

export type MessageCallback = (payload: any, headers: Record<string, string>) => void;
export type StateChangeListener = (state: ConnectionState) => void;

interface ActiveSubscription {
  id: string;
  destination: string;
  callback: MessageCallback;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'DISCONNECTED';
  private subscriptions: Map<string, ActiveSubscription> = new Map();
  private stateListeners: Set<StateChangeListener> = new Set();
  private subCounter = 0;

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private isIntentionallyClosed = false;

  /**
   * Derive the WebSocket endpoint from current API_BASE_URL.
   * e.g. "https://uplink-kzh3.onrender.com/api" -> "wss://uplink-kzh3.onrender.com/ws-raw"
   * e.g. "http://localhost:8080/api"           -> "ws://localhost:8080/ws-raw"
   */
  public getWebSocketUrl(): string {
    const httpBase = ENV.API_BASE_URL.replace(/\/api\/?$/, '');
    let wsUrl = httpBase.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
    return `${wsUrl}/ws-raw`;
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public isConnected(): boolean {
    return this.state === 'CONNECTED';
  }

  public onStateChange(listener: StateChangeListener): () => void {
    this.stateListeners.add(listener);
    // Notify current state immediately
    listener(this.state);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private setState(newState: ConnectionState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach((listener) => {
        try {
          listener(newState);
        } catch (e) {
          if (ENV.DEBUG_LOGGING) console.warn('[WebSocket] Listener error:', e);
        }
      });
    }
  }

  /**
   * Connect to the WebSocket STOMP broker.
   */
  /**
     * Connect to the WebSocket STOMP broker.
     */
  public async connect(): Promise<void> {
    if (this.state === 'CONNECTED' || this.state === 'CONNECTING') {
      return;
    }

    const token = await tokenStorage.getAccessToken();
    if (!token) {
      if (ENV.DEBUG_LOGGING) {
        console.log('[WebSocket] Skipping connect: no access token available.');
      }
      this.setState('DISCONNECTED');
      return;
    }

    this.isIntentionallyClosed = false;
    this.setState(this.reconnectAttempts > 0 ? 'RECONNECTING' : 'CONNECTING');

    const wsUrl = this.getWebSocketUrl();

    return new Promise<void>((resolve) => {
      let resolved = false;

      try {
        if (ENV.DEBUG_LOGGING) console.log(`[WebSocket] Connecting to ${wsUrl}...`);
        // Pass Authorization header on the initial HTTP Upgrade handshake for Spring Security
        this.ws = new (WebSocket as any)(wsUrl, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.ws!.onopen = () => {
          if (ENV.DEBUG_LOGGING) console.log('[WebSocket] Socket opened. Sending STOMP CONNECT frame...');
          const headers: Record<string, string> = {
            'accept-version': '1.1,1.2',
            'heart-beat': '10000,10000',
            Authorization: `Bearer ${token}`,
          };

          this.sendFrame('CONNECT', headers);
        };

        this.ws!.onmessage = (event: WebSocketMessageEvent) => {
          this.handleIncomingRaw(event.data, () => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          });
        };

        this.ws!.onerror = (err) => {
          if (ENV.DEBUG_LOGGING) console.warn('[WebSocket] Error occurred:', err);
          if (!resolved && this.reconnectAttempts === 0) {
            resolved = true;
            resolve();
          }
        };

        this.ws!.onclose = (event) => {

          const reason = event.reason || '';
          if (ENV.DEBUG_LOGGING) {
            console.log(`[WebSocket] Connection closed (code: ${event.code}, reason: ${reason})`);
          }
          this.cleanupSocket();
          this.setState('DISCONNECTED');
          const isFatalRejection =
            reason.includes('401') || reason.includes('403') || reason.includes('500');
          if (!this.isIntentionallyClosed && !isFatalRejection) {
            this.scheduleReconnect();
          }
          if (!resolved) {
            resolved = true;
            resolve();
          }

          // Do not spam reconnects if rejected due to auth/forbidden
          const isAuthRejection = reason.includes('401') || reason.includes('403');
          if (!this.isIntentionallyClosed && !isAuthRejection) {
            this.scheduleReconnect();
          }
        };
      } catch (err) {
        if (ENV.DEBUG_LOGGING) console.warn('[WebSocket] Connect exception:', err);
        this.cleanupSocket();
        this.setState('DISCONNECTED');
        resolve();
        this.scheduleReconnect();
      }
    });
  }
  /**
   * Gracefully disconnect from broker.
   */
  public disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;

    if (this.ws && this.state === 'CONNECTED') {
      try {
        this.sendFrame('DISCONNECT', {});
      } catch {
        // Ignore
      }
    }

    this.cleanupSocket();
    this.setState('DISCONNECTED');
  }

  /**
   * Subscribe to a STOMP topic or queue.
   * Automatically re-subscribes if the connection drops and recovers.
   *
   * @param destination e.g. "/topic/conversations.abc" or "/topic/user.123.messages"
   * @param callback Called when a message arrives on this destination
   * @returns Unsubscribe function
   */
  public subscribe(destination: string, callback: MessageCallback): () => void {
    const subId = `sub-${++this.subCounter}`;
    const sub: ActiveSubscription = { id: subId, destination, callback };
    this.subscriptions.set(subId, sub);

    // If currently connected, send SUBSCRIBE frame immediately
    if (this.isConnected()) {
      this.sendFrame('SUBSCRIBE', {
        id: subId,
        destination,
        ack: 'auto',
      });
    }

    return () => {
      this.subscriptions.delete(subId);
      if (this.isConnected()) {
        try {
          this.sendFrame('UNSUBSCRIBE', { id: subId });
        } catch (e) {
          if (ENV.DEBUG_LOGGING) console.warn('[WebSocket] Unsubscribe error:', e);
        }
      }
    };
  }

  /**
   * Publish a message to a STOMP destination.
   */
  public send(destination: string, body: any, headers: Record<string, string> = {}): boolean {
    if (!this.isConnected()) {
      return false;
    }

    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    this.sendFrame(
      'SEND',
      {
        destination,
        'content-type': 'application/json',
        ...headers,
      },
      payload
    );
    return true;
  }

  // -------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------

  private cleanupSocket() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      try {
        this.ws.close();
      } catch {
        // Ignore
      }
      this.ws = null;
    }
  }

  private scheduleReconnect() {
    if (this.isIntentionallyClosed) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (ENV.DEBUG_LOGGING) console.log('[WebSocket] Max reconnect attempts reached.');
      return;
    }

    this.reconnectAttempts++;
    // Exponential backoff: 1s, 2s, 4s, 8s, up to 15s max with jitter
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000) + Math.random() * 500;
    if (ENV.DEBUG_LOGGING) {
      console.log(`[WebSocket] Scheduling reconnect in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})...`);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    // Send STOMP heartbeat ping (\n) every 10 seconds to keep connection alive
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send('\n');
        } catch {
          // Ignore
        }
      }
    }, 10000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private sendFrame(command: string, headers: Record<string, string>, body = '') {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    let frame = `${command}\n`;
    for (const [key, value] of Object.entries(headers)) {
      frame += `${key}:${value}\n`;
    }
    frame += `\n${body}\0`;

    this.ws.send(frame);
  }

  private handleIncomingRaw(raw: any, onConnected?: () => void) {
    if (typeof raw !== 'string') return;

    // Handle heartbeats (\n or \r\n)
    if (raw === '\n' || raw === '\r\n') return;

    // A single message chunk might contain multiple null-terminated STOMP frames
    const frames = raw.split('\0');
    for (const frameText of frames) {
      const trimmed = frameText.trim();
      if (!trimmed) continue;

      const lines = trimmed.split('\n');
      const command = lines[0].trim();
      const headers: Record<string, string> = {};
      let bodyStartIndex = -1;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === '' || line === '\r') {
          bodyStartIndex = i + 1;
          break;
        }
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const key = line.substring(0, colonIndex).trim();
          const val = line.substring(colonIndex + 1).trim();
          headers[key] = val;
        }
      }

      let body = '';
      if (bodyStartIndex !== -1 && bodyStartIndex < lines.length) {
        body = lines.slice(bodyStartIndex).join('\n').trim();
      }

      this.processStompFrame(command, headers, body, onConnected);
    }
  }

  private processStompFrame(
    command: string,
    headers: Record<string, string>,
    body: string,
    onConnected?: () => void
  ) {
    if (command === 'CONNECTED') {
      if (ENV.DEBUG_LOGGING) console.log('[WebSocket] STOMP CONNECTED successfully!');
      this.setState('CONNECTED');
      this.reconnectAttempts = 0;
      this.startHeartbeat();

      // Re-subscribe all active subscriptions
      this.subscriptions.forEach((sub) => {
        this.sendFrame('SUBSCRIBE', {
          id: sub.id,
          destination: sub.destination,
          ack: 'auto',
        });
      });

      if (onConnected) onConnected();
    } else if (command === 'MESSAGE') {
      let parsedPayload: any = body;
      try {
        parsedPayload = JSON.parse(body);
      } catch {
        // Keep as string if not JSON
      }

      const destination = headers.destination;
      const subId = headers.subscription;

      // Dispatch to matching subscriptions
      this.subscriptions.forEach((sub) => {
        if (sub.id === subId || sub.destination === destination) {
          try {
            sub.callback(parsedPayload, headers);
          } catch (err) {
            if (ENV.DEBUG_LOGGING) console.warn('[WebSocket] Callback dispatch error:', err);
          }
        }
      });
    } else if (command === 'ERROR') {
      if (ENV.DEBUG_LOGGING) console.warn('[WebSocket] STOMP Error Frame:', headers, body);
    }
  }
}

export const websocketService = new WebSocketService();
