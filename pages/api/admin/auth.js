import { verifyPassword, setAuthCookie, clearAuthCookie, isAuthenticated } from '@/lib/admin-auth'

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body || {}

    if (!password || !verifyPassword(password)) {
      return res.status(401).json({ error: 'Wrong password' })
    }

    setAuthCookie(res)
    return res.status(200).json({ success: true })
  }

  if (req.method === 'DELETE') {
    clearAuthCookie(res)
    return res.status(200).json({ success: true })
  }

  if (req.method === 'GET') {
    return res.status(200).json({ authenticated: isAuthenticated(req) })
  }

  res.setHeader('Allow', 'GET, POST, DELETE')
  return res.status(405).end('Method Not Allowed')
}
