import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import { sql } from 'kysely'
import { AppContext } from './context'
import { getMetrics, getContentType } from './metrics'

const startedAt = Date.now()
const banner = fs.readFileSync(path.join(__dirname, '..', 'banner.txt'), 'utf-8')

export const createRouter = (ctx: AppContext): Router => {
  const router = Router()

  router.get('/', function (req, res) {
    res.type('text/plain')
    res.send(banner)
  })

  router.get('/robots.txt', function (req, res) {
    res.type('text/plain')
    res.send(
      '# Hello!\n\n# Crawling the public API is allowed\nUser-agent: *\nAllow: /',
    )
  })

  router.get('/xrpc/_health', async function (req, res) {
    const { version } = ctx.cfg.service
    try {
      await sql`select 1`.execute(ctx.accountManager.db.db)
    } catch (err) {
      req.log.error({ err }, 'failed health check')
      res.status(503).send({ version, error: 'Service Unavailable' })
      return
    }

    // Enhanced health info
    const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000)

    let diskUsagePercent: number | null = null
    try {
      // Use the directory of the account DB to check disk usage of the data volume
      const dataDir = require('node:path').dirname(ctx.cfg.db.accountDbLoc)
      const stat = fs.statfsSync(dataDir)
      const totalBytes = stat.bsize * stat.blocks
      const freeBytes = stat.bsize * stat.bavail
      diskUsagePercent =
        Math.round(((totalBytes - freeBytes) / totalBytes) * 1000) / 10
    } catch {
      // statfs not available on all platforms
    }

    let accountCount: number | null = null
    try {
      const result = await sql<{
        cnt: number
      }>`select count(*) as cnt from account`.execute(ctx.accountManager.db.db)
      accountCount = result.rows[0]?.cnt ?? null
    } catch {
      // table may not exist yet
    }

    res.send({
      version,
      uptimeSeconds,
      ...(diskUsagePercent !== null && { diskUsagePercent }),
      ...(accountCount !== null && { accountCount }),
    })
  })

  router.get('/metrics', async function (req, res) {
    try {
      const metrics = await getMetrics()
      res.set('Content-Type', getContentType())
      res.send(metrics)
    } catch (err) {
      req.log.error({ err }, 'failed to collect metrics')
      res.status(500).send('Error collecting metrics')
    }
  })

  return router
}
