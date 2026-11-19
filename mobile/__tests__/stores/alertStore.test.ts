import { useAlertStore } from '../../src/store/alertStore';

describe('alertStore', () => {
  beforeEach(() => {
    useAlertStore.getState().dismissAlert();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('showAlert sets active alert and auto-dismisses after timeout', () => {
    useAlertStore.getState().showAlert({
      type: 'MESSAGE',
      title: 'Jane Doe',
      subtitle: 'Hey there!',
      data: { conversationId: 'conv-123' },
    });

    const currentAlert = useAlertStore.getState().activeAlert;
    expect(currentAlert).not.toBeNull();
    expect(currentAlert?.title).toBe('Jane Doe');
    expect(currentAlert?.subtitle).toBe('Hey there!');
    expect(currentAlert?.type).toBe('MESSAGE');

    // Fast forward timers
    jest.advanceTimersByTime(4600);

    expect(useAlertStore.getState().activeAlert).toBeNull();
  });

  test('dismissAlert clears alert immediately', () => {
    useAlertStore.getState().showAlert({
      type: 'NOTIFICATION',
      title: 'Application Approved',
      subtitle: 'Congratulations!',
    });

    expect(useAlertStore.getState().activeAlert).not.toBeNull();
    useAlertStore.getState().dismissAlert();
    expect(useAlertStore.getState().activeAlert).toBeNull();
  });
});
