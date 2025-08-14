import { Resend } from 'resend';

import { env } from '@esk/utils/env';

export const resend = new Resend(env.RESEND_API_KEY);
