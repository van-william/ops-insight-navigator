import { Handler, EventHeaders } from '@netlify/functions';

// Define base types for our JSON structure
type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// Define specific types for our log structure
type LogLevel = 'info' | 'error' | 'debug';
type LogType = 'auth' | 'error' | 'debug';

interface LogDetails {
  provider?: string;
  redirectUrl?: string;
  origin?: string;
  currentUrl?: string;
  error?: string;
  headers?: Record<string, string>;
  requestId?: string;
  functionName?: string;
  requestHeaders?: Record<string, string>;
  netlifyContext?: {
    site?: string;
    deployId?: string;
    deployUrl?: string;
  };
  [key: string]: JsonValue | undefined;
}

interface LogPayload {
  type: LogType;
  message: string;
  details?: LogDetails;
  timestamp?: string;
  environment?: string;
  level?: LogLevel;
}

// Function to redact sensitive information
function redactSensitiveInfo(obj: JsonValue): JsonValue {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Deep clone to avoid modifying original
  const clone = JSON.parse(JSON.stringify(obj));
  
  const sensitiveKeys = [
    'x-forwarded-for',
    'x-nf-client-connection-ip',
    'x-nf-geo',
    'x-nf-account-id',
    'x-nf-site-id',
    'x-nf-request-id',
    'requestId',
    'functionName',
    'user-agent',
    'host',
    'origin',
    'referer'
  ];

  const redactObject = (value: JsonValue): JsonValue => {
    if (!value || typeof value !== 'object') return value;

    if (Array.isArray(value)) {
      return value.map(item => redactObject(item));
    }

    const obj = value as JsonObject;
    
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        obj[key] = redactObject(obj[key]);
        continue;
      }
      
      if (sensitiveKeys.includes(key.toLowerCase())) {
        obj[key] = '[REDACTED]';
      }
      
      // Redact IP addresses
      if (typeof obj[key] === 'string' && /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(obj[key])) {
        obj[key] = '[REDACTED_IP]';
      }
      
      // Redact encoded data that might contain sensitive info
      if (typeof obj[key] === 'string' && obj[key].startsWith('eyJ')) {
        obj[key] = '[REDACTED_ENCODED]';
      }
    }
    return obj;
  };

  return redactObject(clone);
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
    const log: LogPayload = {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      environment: payload.environment || process.env.NETLIFY_ENV || 'development',
      // Add request context
      details: {
        ...payload.details,
        requestId: context.awsRequestId,
        functionName: context.functionName,
        requestHeaders: Object.fromEntries(
          Object.entries(event.headers).map(([k, v]) => [k, String(v)])
        ),
        netlifyContext: {
          site: process.env.SITE_NAME,
          deployId: process.env.DEPLOY_ID,
          deployUrl: process.env.DEPLOY_URL,
        }
      }
    };

    // Redact sensitive information before logging
    const redactedLog = redactSensitiveInfo(log as JsonValue) as LogPayload;

    // Format log based on level
    const logPrefix = `[${redactedLog.level || 'info'}] [${redactedLog.type}]`;
    console.log(`${logPrefix} ${JSON.stringify(redactedLog, null, 2)}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Log recorded successfully',
        log: redactedLog 
      }),
    };
  } catch (error) {
    const errorPayload: LogPayload = {
      type: 'error',
      message: 'Error processing log',
      details: {
        error: String(error),
        originalBody: event.body,
      },
      timestamp: new Date().toISOString(),
      level: 'error'
    };
    
    const errorLog = redactSensitiveInfo(errorPayload as JsonValue) as LogPayload;
    console.error(JSON.stringify(errorLog, null, 2));
    return {
      statusCode: 500,
      body: JSON.stringify(errorLog),
    };
  }
}; 