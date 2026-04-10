import { Router, Request, Response } from 'express'
import { pool } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'
import crypto from 'crypto'

const router = Router()

// 生成分享链接
router.post('/projects/:id/share', authenticate, async (req: Request, res: Response) => {
  try {
    const { id: projectId } = req.params
    const { permission = 'view', expiresAt } = req.body
    const userId = (req as any).user.userId

    // 验证项目所有权
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    )

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '项目不存在或无权限' },
      })
    }

    // 生成唯一 token
    const token = crypto.randomBytes(16).toString('hex')

    // 插入分享链接
    const result = await pool.query(
      `INSERT INTO share_links (project_id, token, permission, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [projectId, token, permission, expiresAt || null]
    )

    const shareLink = result.rows[0]
    const appUrl = process.env.APP_URL || 'http://localhost:5173'

    res.json({
      success: true,
      data: {
        token: shareLink.token,
        url: `${appUrl}/share/${shareLink.token}`,
        permission: shareLink.permission,
        expiresAt: shareLink.expires_at,
        createdAt: shareLink.created_at,
      },
    })
  } catch (error) {
    console.error('生成分享链接失败:', error)
    res.status(500).json({
      success: false,
      error: { message: '生成分享链接失败' },
    })
  }
})

// 获取分享项目（无需认证）
router.get('/share/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params

    // 查询分享链接
    const linkResult = await pool.query(
      `SELECT sl.*, p.name, p.description
       FROM share_links sl
       JOIN projects p ON sl.project_id = p.id
       WHERE sl.token = $1 AND sl.revoked_at IS NULL`,
      [token]
    )

    if (linkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '分享链接不存在或已失效' },
      })
    }

    const shareLink = linkResult.rows[0]

    // 检查是否过期
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        error: { message: '分享链接已过期' },
      })
    }

    // 获取项目任务
    const tasksResult = await pool.query(
      'SELECT * FROM tasks WHERE project_id = $1 ORDER BY position ASC',
      [shareLink.project_id]
    )

    // 更新访问次数
    await pool.query(
      'UPDATE share_links SET access_count = access_count + 1, last_accessed_at = NOW() WHERE token = $1',
      [token]
    )

    res.json({
      success: true,
      data: {
        project: {
          id: shareLink.project_id,
          name: shareLink.name,
          description: shareLink.description,
          tasks: tasksResult.rows,
        },
        permission: shareLink.permission,
        expiresAt: shareLink.expires_at,
      },
    })
  } catch (error) {
    console.error('获取分享项目失败:', error)
    res.status(500).json({
      success: false,
      error: { message: '获取分享项目失败' },
    })
  }
})

// 更新分享权限
router.put('/share/:token/permissions', authenticate, async (req: Request, res: Response) => {
  try {
    const { token } = req.params
    const { permission, expiresAt } = req.body
    const userId = (req as any).user.userId

    // 验证所有权
    const result = await pool.query(
      `SELECT sl.* FROM share_links sl
       JOIN projects p ON sl.project_id = p.id
       WHERE sl.token = $1 AND p.user_id = $2`,
      [token, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '分享链接不存在或无权限' },
      })
    }

    // 更新权限
    const updateResult = await pool.query(
      `UPDATE share_links
       SET permission = COALESCE($1, permission),
           expires_at = COALESCE($2, expires_at),
           updated_at = NOW()
       WHERE token = $3
       RETURNING *`,
      [permission, expiresAt, token]
    )

    res.json({
      success: true,
      data: updateResult.rows[0],
    })
  } catch (error) {
    console.error('更新分享权限失败:', error)
    res.status(500).json({
      success: false,
      error: { message: '更新分享权限失败' },
    })
  }
})

// 撤销分享链接
router.delete('/share/:token', authenticate, async (req: Request, res: Response) => {
  try {
    const { token } = req.params
    const userId = (req as any).user.userId

    // 验证所有权
    const result = await pool.query(
      `UPDATE share_links sl
       SET revoked_at = NOW()
       FROM projects p
       WHERE sl.project_id = p.id
         AND sl.token = $1
         AND p.user_id = $2
       RETURNING sl.*`,
      [token, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '分享链接不存在或无权限' },
      })
    }

    res.json({
      success: true,
      message: '分享链接已撤销',
    })
  } catch (error) {
    console.error('撤销分享链接失败:', error)
    res.status(500).json({
      success: false,
      error: { message: '撤销分享链接失败' },
    })
  }
})

// 获取项目的所有分享链接
router.get('/projects/:id/shares', authenticate, async (req: Request, res: Response) => {
  try {
    const { id: projectId } = req.params
    const userId = (req as any).user.userId

    // 验证项目所有权
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    )

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '项目不存在或无权限' },
      })
    }

    // 获取所有分享链接
    const result = await pool.query(
      `SELECT * FROM share_links
       WHERE project_id = $1 AND revoked_at IS NULL
       ORDER BY created_at DESC`,
      [projectId]
    )

    const appUrl = process.env.APP_URL || 'http://localhost:5173'
    const shares = result.rows.map(share => ({
      ...share,
      url: `${appUrl}/share/${share.token}`,
    }))

    res.json({
      success: true,
      data: shares,
    })
  } catch (error) {
    console.error('获取分享链接列表失败:', error)
    res.status(500).json({
      success: false,
      error: { message: '获取分享链接列表失败' },
    })
  }
})

export default router
