import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const clientId = process.env.APPLE_SERVICES_ID!;
  const redirectUri = process.env.APPLE_REDIRECT_URI!;
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'name email',
    state,
    nonce,
    response_mode: 'form_post',
  });

  const url = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  return NextResponse.redirect(url);
}
