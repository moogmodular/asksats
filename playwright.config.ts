import { PlaywrightTestConfig, devices } from '@playwright/test'

const baseUrl = process.env.COMPOSITE_DOMAIN || 'http://192.168.0.199:3000'
console.log(`ℹ️ Using base URL "${baseUrl}"`)

const opts = {
    // launch headless on CI, in browser locally
    headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
    // collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS
}
const config: PlaywrightTestConfig = {
    testDir: './playwright',
    timeout: 35e3,
    outputDir: './playwright/test-results',
    // 'github' for GitHub Actions CI to generate annotations, plus a concise 'dot'
    // default 'list' when running locally
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        baseURL: baseUrl,
        headless: opts.headless,
        video: 'on',
    },
    fullyParallel: false,
    // testMatch: ['auth.test.ts'],
    // testMatch: ['user.test.ts'],
    // testMatch: ['offer.test.ts'],
    // testMatch: ['ask.test.ts'],
    // testMatch: ['ask-public.test.ts'],
    // testMatch: ['ask-bump-public.test.ts'],
    // testMatch: ['ask-private.test.ts'],
}

export default config
