import { websocketService } from '../../src/services/api/websocketService';
import { tokenStorage } from '../../src/services/api/tokenStorage';

// Mock WebSocket implementation simulating a STOMP broker
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  readyState: number = 0; // CONNECTING
  sentFrames: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: any }) => void) | null = null;
  onerror: ((err: any) => void) | null = null;
  onclose: ((ev: { code: number; reason: string }) => void) | null = null;

  static OPEN = 1;
  static CLOSED = 3;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    // Simulate socket open on next tick
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen();
    }, 5);
  }

  send(data: string) {
    this.sentFrames.push(data);
    // Auto-respond to STOMP CONNECT frame
    if (data.startsWith('CONNECT')) {
      setTimeout(() => {
        this.receiveServerFrame('CONNECTED\nversion:1.2\nheart-beat:10000,10000\n\n\0');
      }, 5);
    }
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose({ code: 1000, reason: 'Normal closure' });
  }

  receiveServerFrame(frame: string) {
    if (this.onmessage) {
      this.onmessage({ data: frame });
    }
  }
}

(globalThis as any).WebSocket = MockWebSocket;

describe('websocketService', () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    websocketService.disconnect();
    jest.clearAllMocks();
    jest.spyOn(tokenStorage, 'getAccessToken').mockResolvedValue('test-jwt-token');
  });

  afterEach(() => {
    websocketService.disconnect();
  });

  test('derives WebSocket endpoint correctly from ENV', () => {
    const wsUrl = websocketService.getWebSocketUrl();
    expect(wsUrl).toMatch(/^wss?:\/\//);
    expect(wsUrl).toContain('/ws-raw');
  });

  test('connects and receives STOMP CONNECTED confirmation', async () => {
    await websocketService.connect();

    expect(MockWebSocket.instances.length).toBe(1);
    const mockSocket = MockWebSocket.instances[0];

    // Verify CONNECT frame was sent
    expect(mockSocket.sentFrames.length).toBeGreaterThan(0);
    expect(mockSocket.sentFrames[0]).toContain('CONNECT');
    expect(mockSocket.sentFrames[0]).toContain('accept-version:1.1,1.2');
    expect(websocketService.isConnected()).toBe(true);
    expect(websocketService.getState()).toBe('CONNECTED');
  });

  test('subscribes to topic and dispatches incoming MESSAGE frame', async () => {
    await websocketService.connect();

    const mockSocket = MockWebSocket.instances[0];
    const messageCallback = jest.fn();
    const unsub = websocketService.subscribe('/topic/conversations.conv-1', messageCallback);

    // Verify SUBSCRIBE frame sent
    const subscribeFrame = mockSocket.sentFrames.find((f) => f.includes('SUBSCRIBE'));
    expect(subscribeFrame).toBeDefined();
    expect(subscribeFrame).toContain('destination:/topic/conversations.conv-1');

    // Simulate incoming MESSAGE
    const payload = { id: 'msg-1', content: 'Real-time test message' };
    const incomingFrame = `MESSAGE\ndestination:/topic/conversations.conv-1\nsubscription:sub-1\n\n${JSON.stringify(
      payload
    )}\0`;

    mockSocket.receiveServerFrame(incomingFrame);

    expect(messageCallback).toHaveBeenCalledWith(payload, expect.any(Object));

    // Test unsubscribe
    unsub();
    const unsubFrame = mockSocket.sentFrames.find((f) => f.includes('UNSUBSCRIBE'));
    expect(unsubFrame).toBeDefined();
  });

  test('disconnect cleans up state and marks disconnected', async () => {
    await websocketService.connect();
    expect(websocketService.isConnected()).toBe(true);

    websocketService.disconnect();
    expect(websocketService.isConnected()).toBe(false);
    expect(websocketService.getState()).toBe('DISCONNECTED');
  });
});
