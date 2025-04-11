import { Handler } from '@netlify/functions';

interface LogPayload {
  type: 'auth' | 'error' | 'debug';
  message: string;
  details?: {
    provider?: string;
    redirectUrl?: string;
    origin?: string;
    currentUrl?: string;
    error?: string;
    configuredUrls?: string[];
    headers?: Record<string, string>;
    [key: string]: unknown;
  };
  timestamp?: string;
  environment?: string;
  level?: 'info' | 'error' | 'debug';
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
      // Add request context
      details: {
        ...payload.details,
        requestId: context.awsRequestId,
        functionName: context.functionName,
        requestHeaders: event.headers,
        netlifyContext: {
          site: process.env.SITE_NAME,
          deployId: process.env.DEPLOY_ID,
          deployUrl: process.env.DEPLOY_URL,
        }
      }
    };

    // Format log based on level
    const logPrefix = `[${log.level || 'info'}] [${log.type}]`;
    console.log(`${logPrefix} ${JSON.stringify(log, null, 2)}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Log recorded successfully', log }),
    };
  } catch (error) {
    const errorLog = {
      type: 'error',
      message: 'Error processing log',
      details: {
        error: String(error),
        originalBody: event.body,
      },
      timestamp: new Date().toISOString(),
      level: 'error'
    };
    console.error(JSON.stringify(errorLog, null, 2));
    return {
      statusCode: 500,
      body: JSON.stringify(errorLog),
    };
  }
}; 