import {
  verificationService,
  UserVerification,
} from '../../src/services/verificationService';
import { apiClient } from '../../src/services/api/apiClient';

describe('verificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockVerification: UserVerification = {
    id: 'verif-1',
    type: 'COLLEGE_ID',
    status: 'PENDING',
    documentUrl: 'https://storage.uplink.edu/docs/college_id.pdf',
    remarks: 'Submitted for enrollment badge',
  };

  test('submitVerification calls POST /verification/submit', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockVerification,
      statusCode: 201,
    });

    const res = await verificationService.submitVerification({
      type: 'COLLEGE_ID',
      documentUrl: 'https://storage.uplink.edu/docs/college_id.pdf',
      remarks: 'Submitted for enrollment badge',
    });

    expect(postSpy).toHaveBeenCalledWith('/verification/submit', {
      type: 'COLLEGE_ID',
      documentUrl: 'https://storage.uplink.edu/docs/college_id.pdf',
      remarks: 'Submitted for enrollment badge',
    });
    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('PENDING');
  });

  test('getMyVerifications calls GET /verification/my', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [mockVerification],
      statusCode: 200,
    });

    const res = await verificationService.getMyVerifications();
    expect(getSpy).toHaveBeenCalledWith('/verification/my');
    expect(res.success).toBe(true);
    expect(res.data?.length).toBe(1);
  });
});

