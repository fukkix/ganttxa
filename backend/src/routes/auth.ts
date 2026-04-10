import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database.js'
import { createError } from '../middleware/errorHandler.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body

    // 验证输入
    if (!email || !password) {
      throw createError('邮箱和密码不能为空', 400)
    }

    if (password.length < 6) {
      throw createError('密码长度至少为 6 位', 400)
    }

    // 检查用户是否已存在
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      throw createError('邮箱已被注册', 400)
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 创建用户
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name, created_at`,
      [email, passwordHash, displayName || email.split('@')[0]]
    )

    const user = result.rows[0]

    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name
        },
        token
      }
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    // 验证输入
    if (!email || !password) {
      throw createError('邮箱和密码不能为空', 400)
    }

    // 查找用户
    const result = await pool.query(
      'SELECT id, email, password_hash, display_name FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      throw createError('邮箱或密码错误', 401)
    }

    const user = result.rows[0]

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      throw createError('邮箱或密码错误', 401)
    }

    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name
        },
        token
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取当前用户信息
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      throw createError('未提供认证令牌', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    const result = await pool.query(
      'SELECT id, email, display_name, created_at FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      throw createError('用户不存在', 404)
    }

    const user = result.rows[0]

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router

