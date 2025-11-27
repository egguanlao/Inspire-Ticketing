import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed IP address from environment variable
const ALLOWED_IP = process.env.NEXT_PUBLIC_OFFICE_IP || '122.3.68.106';

// Function to get public IP from ipify.org
async function getPublicIPFromIpify(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || null;
  } catch (error) {
    return null;
  }
}

// Function to extract client IP from request
function getClientIP(request: NextRequest): string | null {
  // Check various headers for the real client IP (in order of priority)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    const firstIP = ips[0];
    if (firstIP) {
      // Remove port if present (e.g., "122.3.68.106:12345" -> "122.3.68.106")
      const cleanIP = firstIP.split(':')[0];
      if (cleanIP && cleanIP !== '::1' && cleanIP !== '127.0.0.1') {
        return cleanIP;
      }
    }
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    const cleanIP = realIP.split(':')[0];
    if (cleanIP && cleanIP !== '::1' && cleanIP !== '127.0.0.1') {
      return cleanIP;
    }
  }

  // Check CF-Connecting-IP (Cloudflare)
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    const cleanIP = cfIP.split(':')[0];
    if (cleanIP && cleanIP !== '::1' && cleanIP !== '127.0.0.1') {
      return cleanIP;
    }
  }

  // Check X-Client-IP
  const clientIP = request.headers.get('x-client-ip');
  if (clientIP) {
    const cleanIP = clientIP.split(':')[0];
    if (cleanIP && cleanIP !== '::1' && cleanIP !== '127.0.0.1') {
      return cleanIP;
    }
  }

  // Check X-Forwarded-For (alternative header name)
  const xForwarded = request.headers.get('x-forwarded');
  if (xForwarded) {
    const cleanIP = xForwarded.split(':')[0];
    if (cleanIP && cleanIP !== '::1' && cleanIP !== '127.0.0.1') {
      return cleanIP;
    }
  }

  // Check X-Original-Forwarded-For
  const xOriginalForwarded = request.headers.get('x-original-forwarded-for');
  if (xOriginalForwarded) {
    const ips = xOriginalForwarded.split(',').map(ip => ip.trim());
    const firstIP = ips[0];
    if (firstIP) {
      const cleanIP = firstIP.split(':')[0];
      if (cleanIP && cleanIP !== '::1' && cleanIP !== '127.0.0.1') {
        return cleanIP;
      }
    }
  }

  // Fallback to direct connection IP
  const ip = request.ip || request.headers.get('x-vercel-forwarded-for');
  if (ip) {
    const cleanIP = ip.split(':')[0];
    if (cleanIP && cleanIP !== '::1' && cleanIP !== '127.0.0.1') {
      return cleanIP;
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check IP for /admin and /complain routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/complain')) {
    let clientIP = getClientIP(request);
    
    // If IP detection from headers failed, try to get public IP from ipify
    if (!clientIP) {
      const publicIP = await getPublicIPFromIpify();
      if (publicIP) {
        clientIP = publicIP;
      }
    }

    // If we can't detect IP, check hostname/URL as fallback
    if (!clientIP) {
      // Fallback: Check if accessing via the allowed IP in the URL/hostname
      const hostname = request.headers.get('host') || request.nextUrl.hostname;
      const urlHost = request.nextUrl.hostname;
      
      // Extract IP from hostname (remove port if present)
      const extractIPFromHost = (host: string | null): string | null => {
        if (!host) return null;
        const hostWithoutPort = host.split(':')[0];
        // Check if it's a valid IP address
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipPattern.test(hostWithoutPort)) {
          return hostWithoutPort;
        }
        return null;
      };
      
      const hostIP = extractIPFromHost(hostname) || extractIPFromHost(urlHost);
      
      if (hostIP && hostIP === ALLOWED_IP) {
        return NextResponse.next();
      }
      
      return NextResponse.redirect(new URL('/blocked', request.url));
    }

    // Check if IP matches the allowed IP from environment variable
    if (clientIP !== ALLOWED_IP) {
      return NextResponse.redirect(new URL('/blocked', request.url));
    }
  }

  // Allow request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ['/admin/:path*', '/complain/:path*'],
};

