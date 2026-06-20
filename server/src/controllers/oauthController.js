import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { signToken, cookieOptions } from '../utils/token.js';

const SERVER_URL = () => process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
const CLIENT_URL = () => process.env.CLIENT_URL || 'http://localhost:5173';

export const googleEnabled = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const facebookEnabled = () => !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

// Find-or-create a user from an external profile, then set auth cookie and redirect home.
async function loginExternal(res, { email, firstName, lastName }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      passwordHash: '', // external account, no local password
      roles: ['customer'],
      isVerified: true,
      profile: { firstName, lastName },
    });
  }
  res.cookie('token', signToken(user), cookieOptions);
  res.redirect(CLIENT_URL());
}

// GET /api/auth/google
export const googleStart = (req, res) => {
  if (!googleEnabled()) return res.status(501).json({ message: 'Google login chưa cấu hình' });
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${SERVER_URL()}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

// GET /api/auth/google/callback
export const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${CLIENT_URL()}/login?error=oauth`);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${SERVER_URL()}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });
  const token = await tokenRes.json();
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const profile = await profileRes.json();
  if (!profile.email) return res.redirect(`${CLIENT_URL()}/login?error=oauth`);

  await loginExternal(res, {
    email: profile.email,
    firstName: profile.given_name,
    lastName: profile.family_name,
  });
});

// GET /api/auth/facebook
export const facebookStart = (req, res) => {
  if (!facebookEnabled()) return res.status(501).json({ message: 'Facebook login chưa cấu hình' });
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID,
    redirect_uri: `${SERVER_URL()}/api/auth/facebook/callback`,
    response_type: 'code',
    scope: 'email,public_profile',
  });
  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
};

// GET /api/auth/facebook/callback
export const facebookCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${CLIENT_URL()}/login?error=oauth`);

  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      redirect_uri: `${SERVER_URL()}/api/auth/facebook/callback`,
      code,
    })}`
  );
  const token = await tokenRes.json();
  const profileRes = await fetch(
    `https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token=${token.access_token}`
  );
  const profile = await profileRes.json();
  const email = profile.email || `fb_${profile.id}@facebook.local`;

  await loginExternal(res, {
    email,
    firstName: profile.first_name,
    lastName: profile.last_name,
  });
});

// GET /api/auth/providers  -> which social logins are enabled
export const providers = (_req, res) => res.json({ google: googleEnabled(), facebook: facebookEnabled() });
