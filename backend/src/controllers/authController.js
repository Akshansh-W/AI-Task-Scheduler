import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required')
  }

  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email }
}

export async function signUp(request, response, next) {
  try {
    const name = String(request.body.name || '').trim()
    const email = String(request.body.email || '').trim().toLowerCase()
    const password = String(request.body.password || '')

    if (!name || !email || !password) {
      return response.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return response.status(400).json({ message: 'A valid email is required' })
    }

    if (password.length < 8) {
      return response.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: passwordHash })

    return response.status(201).json({ user: publicUser(user), token: createToken(user.id) })
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'An account with this email already exists' })
    }

    next(error)
  }
}

export async function logIn(request, response, next) {
  try {
    const email = String(request.body.email || '').trim().toLowerCase()
    const password = String(request.body.password || '')

    if (!email || !password) {
      return response.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response.status(401).json({ message: 'Invalid email or password' })
    }

    return response.json({ user: publicUser(user), token: createToken(user.id) })
  } catch (error) {
    next(error)
  }
}