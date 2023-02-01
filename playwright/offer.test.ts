import { test } from '@playwright/test'
import {
    changeUserToWalletAndGoHome,
    checkBalanceAndLockedBalance,
    createAskWithAmount,
    placeOfferForAskByTitle,
} from './test-utils'

test.setTimeout(35e3)

test.describe('offer', async () => {
    test('user creates an ask, another user places an offer that gets settled', async ({ page, request }) => {
        await page.goto('/')

        // user authenticates existing account

        await changeUserToWalletAndGoHome(2, page, request, true)

        // user creates ask with 1100 satoshis

        const askTitle = `test ask ${new Date().getTime()} with bump-public for offers`
        await createAskWithAmount(page, 1100, 'bump-public', askTitle)

        await page.reload()

        // user checks his balance

        await checkBalanceAndLockedBalance(page, 3900, 1100)

        // second user authenticates existing account

        await changeUserToWalletAndGoHome(3, page, request)

        // second user places offer for the created ask

        await placeOfferForAskByTitle(page, askTitle)

        // first user authenticates existing account

        await changeUserToWalletAndGoHome(2, page, request)

        // first user checks his ask and settles it

        const firstAskHost2 = await page.locator(`data-testid=ask-preview-host`, { hasText: askTitle })
        await firstAskHost2.locator('id=ask-title-in-ask-preview').click()

        const firstOfferHost = await page.locator('id=offer-display-host-0')
        await firstOfferHost.locator('id=settle-ask-button').click()

        // user checks his balance

        await checkBalanceAndLockedBalance(page, 3900, 0)

        // second user checks his balance

        await changeUserToWalletAndGoHome(3, page, request)

        await checkBalanceAndLockedBalance(page, 6001, 0)
    })
})
