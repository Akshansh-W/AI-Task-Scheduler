import jwt from 'jsonwebtoken'

export function requireAuth(request, response, next) {
  const authorization = request.get('authorization') || ''
  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ message: 'Authentication required' })
  }

  if (!process.env.JWT_SECRET) {
    return response.status(500).json({ message: 'JWT_SECRET is not configured' })
  }

  try {
    request.auth = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch {
    return response.status(401).json({ message: 'Invalid or expired token' })
  }
}