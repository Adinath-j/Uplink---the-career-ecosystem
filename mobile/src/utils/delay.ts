/**
 * Utility helper to simulate network latency in mock service calls.
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};
