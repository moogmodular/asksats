import { getParams, LNURLAuthParams } from 'js-lnurl'
import { APIRequestContext, expect, Page } from '@playwright/test'
import { signMessageWithWallet } from '~/utils/wallet'
import { randomBytes } from 'crypto'
import { wallets } from '../prisma/seed/wallets'
const bip39 = require('bip39')
const BitcoinWIF = require('bitcoin-wif')
export const getSigAndKey = (cb: { k1: string }, privateKey: string) => {
    const { publicKey, exportedSignature } = signMessageWithWallet(cb.k1, privateKey)
    const sig = Buffer.from(exportedSignature).toString('hex')
    const key = Buffer.from(publicKey).toString('hex')
    return { sig, key }
}

export const checkObscureFileShouldBeVisibleByAskTitleOrNot = async (
    page: Page,
    title: string,
    shouldBeVisible: boolean,
) => {
    const firstAskHost3 = await page.locator(`data-testid=ask-preview-host`, { hasText: title })
    await firstAskHost3.locator('id=ask-title-in-ask-preview').click()

    await page.locator('id=offer-display-host-0').click()

    const offerFileView4 = await page.locator('id=offer-file-view-0')

    await expect(offerFileView4.locator('id=obscure-file-view-0')).toBeVisible()
    if (shouldBeVisible) {
        await expect(offerFileView4.locator('id=offer-file-view-0')).toBeVisible()
    } else {
        await expect(offerFileView4.locator('id=offer-file-view-0')).not.toBeVisible()
    }
}

export const checkBalanceAndLockedBalance = async (page: Page, balance: number, lockedBalance: number) => {
    await page.click('id=button-transact')
    const avAmount2 = await page.waitForSelector(`id=transact-balance-display`)
    const lockedAmount2 = await page.waitForSelector(`id=transact-locked-balance-display`)

    expect(await avAmount2.innerText()).toBe(`Available balance: ${balance}`)
    expect(await lockedAmount2.innerText()).toBe(`Locked balance: ${lockedBalance}`)
    await page.click('id=modal-close')
}

export const placeOfferForAskByTitle = async (page: Page, title: string) => {
    const firstAskHost = await page.locator(`data-testid=ask-preview-host`, { hasText: title })
    await firstAskHost.locator('id=ask-title-in-ask-preview').click()

    await page.click('id=add-offer-button')

    const firstAssetPreviewHost = await page.locator('id=asset-preview-host-0')
    await firstAssetPreviewHost
        .locator('id=upload-image-for-offer-input')
        .setInputFiles('./public/small_upload_image.png')
    await firstAssetPreviewHost.locator('id=select-quick-edit').click()
    await page.locator('id=quick-edit-action-blur').click()

    await page.getByText('Save').click()
    await page.getByRole('button', { name: 'Save' }).nth(1).click()
    await page.click('id=create-offer-submit')
}

export const bumpAskOnIndexWithAmount = async (page: Page, index: number, amount: number) => {
    const firstAskHost = await page.locator(`id=ask-preview-host-${index}`)

    await firstAskHost.locator('id=bump-amount-text-field').fill(`${amount}`)
    await firstAskHost.locator('id=bump-amount-button').click()
}

export const bumpAskByTitleWithAmount = async (page: Page, title: string, amount: number) => {
    const firstAskHost = await page.locator(`data-testid=ask-preview-host`, { hasText: title })

    await firstAskHost.locator('id=bump-amount-text-field').fill(`${amount}`)
    await firstAskHost.locator('id=bump-amount-button').click()
}

export const navigateToAskByTitle = async (page: Page, title: string) => {
    const firstAskHost = await page.locator(`data-testid=ask-preview-host`, { hasText: title })

    await firstAskHost.locator('id=ask-title-in-ask-preview').click()
}

export const createAskWithAmount = async (
    page: Page,
    amount: number,
    type: 'public' | 'bump-public' | 'private',
    title?: string,
) => {
    await page.click('id=create-ask-button')
    await page.getByLabel('Title').fill(title ?? `This is test Created for ${amount}`)
    await page.locator('id=create-ask-amount').fill(`${amount}`)

    await page.click('id=select-bump-kind')
    await page.click(`id=bump-kind-${type}`)
    await page.locator('input[type="file"]').setInputFiles('./public/testimage.png')
    await page.getByRole('img', { name: 'uploaded image' }).click()
    await page.getByRole('button', { name: 'Submit' }).click()
}

export const changeUserToWalletAndGoHome = async (
    walletIndex: number,
    page: Page,
    request: APIRequestContext,
    fromUnauthenticated = false,
) => {
    const btcWIF = new BitcoinWIF('testnet')
    if (!fromUnauthenticated) {
        await page.click('id=logo-link')
        await page.click('id=logout-button')
    }
    const seed2 = await bip39
        .mnemonicToSeed(wallets[walletIndex]?.mnemonic ?? '')
        .then((value: Buffer) => value.toString('hex'))
    const privateKey = btcWIF.privateKey(seed2)
    await page.reload()
    const key = await authenticateUserByPrivateKey(page, privateKey, request, false)

    const publicKeyContainer = await page.waitForSelector(`id=header-property-publicKey`)
    const publicKeyText = await publicKeyContainer?.innerText()

    expect(publicKeyText.slice(0, 24)).toBe(key.slice(0, 24))

    return await key
}

export const authenticateUserByPrivateKey = async (
    page: Page,
    privateKey: string,
    request: APIRequestContext,
    shouldBeNew = false,
) => {
    await page.click('id=open-authenticate-button')

    const bolt11Container = await page.waitForSelector('id=bolt11-text')

    const bolt11Text = await bolt11Container?.innerText()

    const cb = await getParams(bolt11Text ?? '').then((params) => {
        return params as LNURLAuthParams
    })
    const { sig, key } = getSigAndKey(cb, privateKey)

    const authenticateUrl = `${cb.callback}&sig=${sig}&key=${key}`

    await request.get(authenticateUrl)

    if (shouldBeNew) {
        await page.click('id=welcomeContinue')
    }

    return key
}

export const authenticateNewUser = async (page: Page, request: APIRequestContext) => {
    const privateKey = randomBytes(32).toString('hex')
    await page.click('id=open-authenticate-button')

    const bolt11Container = await page.waitForSelector('id=bolt11-text')

    const bolt11Text = await bolt11Container?.innerText()

    const cb = await getParams(bolt11Text ?? '').then((params) => {
        return params as LNURLAuthParams
    })
    const { sig, key } = getSigAndKey(cb, privateKey)

    const authenticateUrl = `${cb.callback}&sig=${sig}&key=${key}`

    await request.get(authenticateUrl)

    await page.click('id=welcomeContinue')

    return key
}

export const authenticateExistingUser = async (page: Page, privateKey: string, request: APIRequestContext) => {
    await page.click('id=open-authenticate-button')

    const bolt11Container = await page.waitForSelector('id=bolt11-text')

    const bolt11Text = await bolt11Container?.innerText()

    const cb = await getParams(bolt11Text ?? '').then((params) => {
        return params as LNURLAuthParams
    })
    const { sig, key } = getSigAndKey(cb, privateKey)

    const authenticateUrl = `${cb.callback}&sig=${sig}&key=${key}`

    await request.get(authenticateUrl)

    return key
}

export const deleteUser = async (page: Page) => {
    await page.click('id=button-edit-profile')
    await page.click('id=edit-profile-delete-user')
}
