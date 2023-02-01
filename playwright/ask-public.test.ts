import { expect, test } from '@playwright/test'
import {
    changeUserToWalletAndGoHome,
    checkObscureFileShouldBeVisibleByAskTitleOrNot,
    createAskWithAmount,
    placeOfferForAskByTitle,
} from './test-utils'

test.setTimeout(35e3)
test.describe('public asks', async () => {
    test('user creates a public ask', async ({ page, request }) => {
        await page.goto('/')

        // user authenticates existing account
        await changeUserToWalletAndGoHome(4, page, request, true)

        // user creates public ask with 1100 satoshis

        const askTitle = `test ask ${new Date().getTime()} with public for ask public`
        await createAskWithAmount(page, 1100, 'public', askTitle)

        // second user authenticates existing account

        await changeUserToWalletAndGoHome(5, page, request)

        // second user places offer for the created ask

        await placeOfferForAskByTitle(page, askTitle)

        // rando user authenticates existing account and checks the ask, he shouldn't see the obscure file

        await changeUserToWalletAndGoHome(6, page, request)

        await checkObscureFileShouldBeVisibleByAskTitleOrNot(page, askTitle, false)

        // first user authenticates existing account and checks the ask, he shouldn't see the obscure file

        await changeUserToWalletAndGoHome(4, page, request)

        await checkObscureFileShouldBeVisibleByAskTitleOrNot(page, askTitle, false)

        await page.click('id=logo-link')

        // first user settles his ask, he should see both the obscure file and the offer file

        const firstAskHost2 = await page.locator(`data-testid=ask-preview-host`, { hasText: askTitle })
        await firstAskHost2.locator('id=ask-title-in-ask-preview').click()

        const firstOfferHost = await page.locator('id=offer-display-host-0')
        await firstOfferHost.locator('id=settle-ask-button').click()

        await page.locator('id=offer-display-host-0').click()

        const offerFileView3 = await page.locator('id=offer-file-view-0')

        await expect(offerFileView3.locator('id=obscure-file-view-0')).toBeVisible()
        await expect(offerFileView3.locator('id=offer-file-view-0')).toBeVisible()

        // rando user authenticates existing account and checks the ask, now after settlement he should see
        // both the obscure file and the offer file

        await changeUserToWalletAndGoHome(6, page, request)

        await checkObscureFileShouldBeVisibleByAskTitleOrNot(page, askTitle, true)
    })
})
