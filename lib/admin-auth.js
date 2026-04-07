import crypto from 'crypto'

const COOKIE_NAME = 'admin_token'

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD
}

function generateToken(password) {
  // HMAC the password with STRIPE_SECRET_KEY as the signing key
  // so we don't need yet another env var
  const secret = process.env.STRIPE_SECRET_KEY
  return crypto.createHmac('sha256', secret).update(password).digest('hex')
}

export function verifyPassword(password) {
  const expected = getAdminPassword()
  if (!expected) return false
  if (password.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected))
}

export function setAuthCookie(res) {
  const token = generateToken(getAdminPassword())
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)
}

export function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)
}

export function isAuthenticated(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return false

  const expected = generateToken(getAdminPassword())
  const provided = match[1]
  if (provided.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

export function requireAuth(handler) {
  return (req, res) => {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return handler(req, res)
  }
}
