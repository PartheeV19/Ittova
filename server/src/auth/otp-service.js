import { issueOtp, acceptOtpDelivery, revokeOtp } from './otp.js';
import { assertDeliveryConfigured, deliverOtp } from './otp-delivery.js';
import { parseOtpRequest } from './otp-input.js';

export function createOtpRequester({ issue = issueOtp, accept = acceptOtpDelivery, revoke = revokeOtp, deliver = deliverOtp, configured = assertDeliveryConfigured } = {}) {
  return async (body) => {
    const input = parseOtpRequest(body);
    configured(input);
    const challenge = await issue(input.contact, input.purpose, input.destinations);
    try {
      const acceptedTo = await deliver({ ...input, ...challenge });
      await accept(challenge.id);
      return { status: 'accepted', acceptedTo, expiresIn: 600, retryAfter: 60 };
    } catch (error) {
      await revoke(challenge.id);
      throw error;
    }
  };
}

export const requestOtpDelivery = createOtpRequester();
