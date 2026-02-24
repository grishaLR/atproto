import fs from 'node:fs'
import { Router } from 'express'
import { sql } from 'kysely'
import { AppContext } from './context'
import { getMetrics, getContentType } from './metrics'

const startedAt = Date.now()

export const createRouter = (ctx: AppContext): Router => {
  const router = Router()

  router.get('/', function (req, res) {
    res.type('text/plain')
    res.send(`

 _________  ___  ___  _______           ________  ________   ___           ___    ___      _________  ___  ___  ___  ________   ________          _____ ______   ________  ________  _______
|\___   ___\\  \|\  \|\  ___ \         |\   __  \|\   ___  \|\  \         |\  \  /  /|    |\___   ___\\  \|\  \|\  \|\   ___  \|\   ____\        |\   _ \  _   \|\   __  \|\   __  \|\  ___ \
\|___ \  \_\ \  \\\  \ \   __/|        \ \  \|\  \ \  \\ \  \ \  \        \ \  \/  / /    \|___ \  \_\ \  \\\  \ \  \ \  \\ \  \ \  \___|        \ \  \\\__\ \  \ \  \|\  \ \  \|\  \ \   __/|
     \ \  \ \ \   __  \ \  \_|/__       \ \  \\\  \ \  \\ \  \ \  \        \ \    / /          \ \  \ \ \   __  \ \  \ \  \\ \  \ \  \  ___       \ \  \\|__| \  \ \  \\\  \ \   _  _\ \  \_|/__
      \ \  \ \ \  \ \  \ \  \_|\ \       \ \  \\\  \ \  \\ \  \ \  \____    \/  /  /            \ \  \ \ \  \ \  \ \  \ \  \\ \  \ \  \|\  \       \ \  \    \ \  \ \  \\\  \ \  \\  \\ \  \_|\ \
       \ \__\ \ \__\ \__\ \_______\       \ \_______\ \__\\ \__\ \_______\__/  / /               \ \__\ \ \__\ \__\ \__\ \__\\ \__\ \_______\       \ \__\    \ \__\ \_______\ \__\\ _\\ \_______\
        \|__|  \|__|\|__|\|_______|        \|_______|\|__| \|__|\|_______|\___/ /                 \|__|  \|__|\|__|\|__|\|__| \|__|\|_______|        \|__|     \|__|\|_______|\|__|\|__|\|_______|
                                                                         \|___|/


     ________  ________  ___       __   _______   ________  ________ ___  ___  ___               _________  ___  ___  ________  ________           ___  ___  ________  _________  _______
    |\   __  \|\   __  \|\  \     |\  \|\  ___ \ |\   __  \|\  _____\\  \|\  \|\  \             |\___   ___\\  \|\  \|\   __  \|\   ___  \        |\  \|\  \|\   __  \|\___   ___\\  ___ \
    \ \  \|\  \ \  \|\  \ \  \    \ \  \ \   __/|\ \  \|\  \ \  \__/\ \  \\\  \ \  \            \|___ \  \_\ \  \\\  \ \  \|\  \ \  \\ \  \       \ \  \\\  \ \  \|\  \|___ \  \_\ \   __/|
     \ \   ____\ \  \\\  \ \  \  __\ \  \ \  \_|/_\ \   _  _\ \   __\\ \  \\\  \ \  \                \ \  \ \ \   __  \ \   __  \ \  \\ \  \       \ \   __  \ \   __  \   \ \  \ \ \  \_|/__
      \ \  \___|\ \  \\\  \ \  \|\__\_\  \ \  \_|\ \ \  \\  \\ \  \_| \ \  \\\  \ \  \____            \ \  \ \ \  \ \  \ \  \ \  \ \  \\ \  \       \ \  \ \  \ \  \ \  \   \ \  \ \ \  \_|\ \
       \ \__\    \ \_______\ \____________\ \_______\ \__\\ _\\ \__\   \ \_______\ \_______\           \ \__\ \ \__\ \__\ \__\ \__\ \__\\ \__\       \ \__\ \__\ \__\ \__\   \ \__\ \ \_______\
        \|__|     \|_______|\|____________|\|_______|\|__|\|__|\|__|    \|_______|\|_______|            \|__|  \|__|\|__|\|__|\|__|\|__| \|__|        \|__|\|__|\|__|\|__|    \|__|  \|_______|



 ___  ________           ___       ________  ___      ___ _______
|\  \|\   ____\         |\  \     |\   __  \|\  \    /  /|\  ___ \
\ \  \ \  \___|_        \ \  \    \ \  \|\  \ \  \  /  / | \   __/|
 \ \  \ \_____  \        \ \  \    \ \  \\\  \ \  \/  / / \ \  \_|/__
  \ \  \|____|\  \        \ \  \____\ \  \\\  \ \    / /   \ \  \_|\ \
   \ \__\____\_\  \        \ \_______\ \_______\ \__/ /     \ \_______\
    \|__|\_________\        \|_______|\|_______|\|__|/       \|_______|
        \|_________|


                    ________  _______   ________   ___  _________  ________
                   |\   __  \|\  ___ \ |\   ___  \|\  \|\___   ___\\   __  \
 ____________      \ \  \|\ /\ \   __/|\ \  \\ \  \ \  \|___ \  \_\ \  \|\  \
|\____________\     \ \   __  \ \  \_|/_\ \  \\ \  \ \  \   \ \  \ \ \  \\\  \
\|____________|      \ \  \|\  \ \  \_|\ \ \  \\ \  \ \  \   \ \  \ \ \  \\\  \
                      \ \_______\ \_______\ \__\\ \__\ \__\   \ \__\ \ \_______\
                       \|_______|\|_______|\|__| \|__|\|__|    \|__|  \|_______|


This is an AT Protocol Personal Data Server (PDS) for protoimsg

Most API routes are under /xrpc/

Code: https://github.com/grishaLR/atproto
 Self-Host: https://github.com/grishaLR/pds
  Protocol: https://atproto.com
`)
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
