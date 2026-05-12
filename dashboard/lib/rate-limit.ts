import { NextRequest } from 'next/server';

// In-memory store for rate limiting (in production, use Redis or similar)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Rate limiting utility for API routes
 * @param identifier - Unique identifier for the client (IP, API key, etc.)
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests allowed in the window
 * @returns Object with success boolean and optional headers
 */
export function rateLimit(
  identifier: string,
  windowMs: number = 60000, // 1 minute default
  maxRequests: number = 10  // 10 requests per window default
) {
  const now = Date.now();
  const resetTime = now + windowMs;
  
  // Clean up old entries periodically
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
  
  const record = rateLimitStore[identifier];
  
  if (!record) {
    // First request from this identifier
    rateLimitStore[identifier] = {
      count: 1,
      resetTime
    };
    
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: new Date(resetTime)
    };
  }
  
  if (record.resetTime < now) {
    // Window has passed, reset counter
    record.count = 1;
    record.resetTime = resetTime;
    
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: new Date(resetTime)
    };
  }
  
  // Increment counter
  record.count += 1;
  
  if (record.count > maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: new Date(record.resetTime)
    };
  }
  
  return {
    success: true,
    remaining: maxRequests - record.count,
    resetTime: new Date(record.resetTime)
  };
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: NextRequest): string {
  // Check for forwarded-for header first (proxy/load balancer)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the forwarded-for chain
    return forwardedFor.split(',')[0].trim();
  }
  
  // Check for real-ip header
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  // Fallback to connecting IP (this might not work in all environments)
  // In Next.js, we can't directly get the socket IP from NextRequest
  // So we'll use a combination of headers or default to a generic identifier
  const forwarded = request.headers.get('x-forwarded');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Last resort: use a combination of user agent and accept headers to create a semi-unique identifier
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const acceptLanguage = request.headers.get('accept-language') || 'unknown';
  
  // Simple hash of the combination
  return `${userAgent}-${acceptLanguage}`.substring(0, 50);
}