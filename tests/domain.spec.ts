import { test, expect } from '@playwright/test'
import fs from 'node:fs/promises'

interface AdapterDomainCheckConfig {
  adapter: string
  target: string
  iframe?: { selector: string; domain: string }
  direct?: { selector: string }
}

const adapterDomains: AdapterDomainCheckConfig[] = [
  {
    adapter: 'agefans',
    target: 'https://www.agedm.io/play/20260189/1/1',
    iframe: {
      selector: '.video_play_wrapper iframe',
      domain: 'jx.wuzhoupai.com',
    },
  },
  {
    adapter: 'girigirilove',
    target: 'https://ani.girigirilove.com/playGV26985-1-1/',
    iframe: {
      selector: '#playleft iframe',
      domain: 'play.girigirilove.top',
    },
  },
  {
    adapter: 'tucao',
    target: 'https://www.tucao.my/play/h4107595/',
    direct: {
      selector: '#player video',
    },
  },
]

adapterDomains.forEach(({ adapter, target, iframe, direct }) => {
  test(`Check domain for ${adapter}`, async ({ page }, testInfo) => {
    const response = await page.goto(target)
    expect(response).not.toBeNull()

    await fs.writeFile(
      testInfo.outputPath('content.html'),
      await page.content()
    )
    await page.screenshot({ path: testInfo.outputPath(`screenshot.png`) })

    // Skip if the site returns an error status (e.g., Cloudflare bot protection returning 403)
    const status = response!.status()
    test.skip(
      status >= 400,
      `Page ${target} is inaccessible (HTTP ${status}) in this environment`
    )

    // Check for known access restriction messages (geo-blocks, Cloudflare challenges, etc.)
    const isAccessRestricted =
      (await page
        .locator(
          'h1:has-text("Sorry, you have been blocked"), h1:has-text("暫不支持該地區訪問")'
        )
        .count()) > 0
    test.skip(
      isAccessRestricted,
      `Page ${target} is blocked or geo-restricted in this environment`
    )

    const finalResponse = response?.request().redirectedFrom()
    expect(
      finalResponse,
      `Target page for ${adapter} returned a 302 redirect. Please check the URL.`
    ).toBeNull()

    if (iframe) {
      const iframeEl = await page.waitForSelector(iframe.selector, {
        timeout: 15_000,
      })
      const iframeSrc = await iframeEl.getAttribute('src')
      expect(iframeSrc, `Failed to find iframe for ${adapter}`).toBeTruthy()
      expect(
        iframeSrc!.includes(iframe.domain),
        `Iframe domain mismatch for ${adapter}: expected ${iframe.domain}, got ${iframeSrc}`
      ).toBeTruthy()
    } else if (direct) {
      const directEl = await page.waitForSelector(direct.selector, {
        timeout: 15_000,
      })
      const videoUrl = await directEl.getAttribute('src')
      expect(videoUrl, `Failed to find video URL for ${adapter}`).toBeTruthy()
    }
  })
})
