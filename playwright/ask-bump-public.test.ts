import { expect, test } from '@playwright/test'
import {
    bumpAskByTitleWithAmount,
    changeUserToWalletAndGoHome,
    checkObscureFileShouldBeVisibleByAskTitleOrNot,
    createAskWithAmount,
    placeOfferForAskByTitle,
} from './test-utils'

test.setTimeout(35e3)
test.describe('bump public asks', async () => {
    test('user creates a bump public ask', async ({ page, request }) => {
        await page.goto('/')

        // user authenticates existing account
        await changeUserToWalletAndGoHome(10, page, request, true)

        const askTitle = `test ask ${new Date().getTime()} with bump-public for ask bump-public`
        await createAskWithAmount(page, 900, 'bump-public', askTitle)

        // second user authenticates existing account

        await changeUserToWalletAndGoHome(11, page, request)

        // second user places offer for the created ask

        await placeOfferForAskByTitle(page, askTitle)

        // third user authenticates existing account

        await changeUserToWalletAndGoHome(12, page, request)

        // third user bumps the ask a few times

        await bumpAskByTitleWithAmount(page, askTitle, 100)
        await bumpAskByTitleWithAmount(page, askTitle, 150)
        await bumpAskByTitleWithAmount(page, askTitle, 333)

        // fourth user authenticates existing account

        await changeUserToWalletAndGoHome(13, page, request)

        // fourth user bumps the ask

        await bumpAskByTitleWithAmount(page, askTitle, 1000)

        // first user authenticates existing account and checks the ask, he shouldn't see the obscure file

        await changeUserToWalletAndGoHome(10, page, request)

        await checkObscureFileShouldBeVisibleByAskTitleOrNot(page, askTitle, false)

        // first user settles his ask, he should see both the obscure file and the offer file

        await page.click('id=logo-link')

        const firstAskHost2 = await page.locator(`data-testid=ask-preview-host`, { hasText: askTitle })
        await firstAskHost2.locator('id=ask-title-in-ask-preview').click()

        const firstOfferHost = await page.locator('id=offer-display-host-0')
        await firstOfferHost.locator('id=settle-ask-button').click()

        await page.locator('id=offer-display-host-0').click()

        const offerFileView3 = await page.locator('id=offer-file-view-0')

        await expect(offerFileView3.locator('id=obscure-file-view-0')).toBeVisible()
        await expect(offerFileView3.locator('id=offer-file-view-0')).toBeVisible()

        // third user authenticates existing account and checks the ask, he should see the obscure file because he bumped it

        await changeUserToWalletAndGoHome(12, page, request)

        await checkObscureFileShouldBeVisibleByAskTitleOrNot(page, askTitle, true)

        // fourth user authenticates existing account and checks the ask, he should see the obscure file because he bumped it

        await changeUserToWalletAndGoHome(13, page, request)

        await checkObscureFileShouldBeVisibleByAskTitleOrNot(page, askTitle, true)

        // rando appears and checks the ask, he shouldn't see the obscure file

        await changeUserToWalletAndGoHome(14, page, request)

        await checkObscureFileShouldBeVisibleByAskTitleOrNot(page, askTitle, false)
    })
})
