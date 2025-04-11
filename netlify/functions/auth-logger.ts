import { Handler } from '@netlify/functions';

interface LogPayload {
  type: 'auth' | 'error';
  message: string;
  details?: {
    provider?: string;
    redirectUrl?: string;
    origin?: string;
    currentUrl?: string;
    error?: string;
    [key: string]: unknown;
  };
  timestamp?: string;
  environment?: string;
}

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as LogPayload;
    
    // Add timestamp and environment if not provided
    const log = {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      environment: payload.environment || process.env.NETLIFY_ENV || 'development',
    };

    // Log to Netlify's logging system
    console.log(JSON.stringify(log));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Log recorded successfully' }),
    };
  } catch (error) {
    console.error('Error processing log:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing log', error: String(error) }),
    };
  }
}; 