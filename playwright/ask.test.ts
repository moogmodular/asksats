import { test } from '@playwright/test'
import {
    bumpAskByTitleWithAmount,
    changeUserToWalletAndGoHome,
    checkBalanceAndLockedBalance,
    createAskWithAmount,
    navigateToAskByTitle,
} from './test-utils'

test.setTimeout(35e3)
test.describe('ask', async () => {
    test('user creates ask and bumps a few times', async ({ page, request }) => {
        await page.goto('/')

        // user authenticates existing account

        await changeUserToWalletAndGoHome(0, page, request, true)

        // user checks his balance

        await checkBalanceAndLockedBalance(page, 5000, 0)

        // user creates ask with 1100 satoshis

        const askTitle = `test ask ${new Date().getTime()} with bump-public for bumps`
        await createAskWithAmount(page, 1100, 'bump-public', askTitle)

        await page.reload()

        // user checks his balance

        await checkBalanceAndLockedBalance(page, 3900, 1100)

        // user bumps his ask several times

        await bumpAskByTitleWithAmount(page, askTitle, 120)
        await bumpAskByTitleWithAmount(page, askTitle, 260)
        await bumpAskByTitleWithAmount(page, askTitle, 360)

        await page.reload()

        // user checks his balance

        await checkBalanceAndLockedBalance(page, 3160, 1840)
    })

    test('user creates ask and another user bumps', async ({ page, request }) => {
        await page.goto('/')

        // user authenticates existing account

        await changeUserToWalletAndGoHome(0, page, request, true)

        // user checks his balance

        await checkBalanceAndLockedBalance(page, 3160, 1840)

        // user creates ask with 240 satoshis

        const askTitle = `test ask ${new Date().getTime()} with public for another user bumps`
        await createAskWithAmount(page, 240, 'public', askTitle)

        // another user authenticates existing account

        await changeUserToWalletAndGoHome(1, page, request)

        // second user bumps first user's ask

        await bumpAskByTitleWithAmount(page, askTitle, 200)
        await bumpAskByTitleWithAmount(page, askTitle, 300)

        // user checks his balance

        await checkBalanceAndLockedBalance(page, 4500, 500)

        // first user logs in again

        await changeUserToWalletAndGoHome(0, page, request)

        // user clicks on his ask, finds the cancel button and clicks it
        await navigateToAskByTitle(page, askTitle)
        await page.click('id=cancel-ask-button')

        // user navigates to home page

        await page.click('id=logo-link')
        await page.reload()

        // user checks his balance

        await checkBalanceAndLockedBalance(page, 3160, 1840)

        // second user logs in

        await changeUserToWalletAndGoHome(1, page, request)

        // second user checks his balance

        await checkBalanceAndLockedBalance(page, 5000, 0)
    })
})
