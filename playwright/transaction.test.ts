import { expect, test } from '@playwright/test'
import { createUser, deleteUser } from './test-utils'
import { wallets } from '../prisma/seed/wallets'
import { PrismaClient } from '@prisma/client'
import { sub } from 'date-fns'

const bip39 = require('bip39')
const BitcoinWIF = require('bitcoin-wif')

test.beforeEach(async ({ page, request }) => {})

test.setTimeout(35e3)

const testPrisma = new PrismaClient()

test.describe('transaction related', async () => {
    test('transaction test', async ({ page, request }) => {
        const btcWIF = new BitcoinWIF('testnet')
        await page.goto('/')

        const seed = await bip39
            .mnemonicToSeed(wallets[0]?.mnemonic ?? '')
            .then((value: Buffer) => value.toString('hex'))
        const privateKey = btcWIF.privateKey(seed)

        const key = await createUser(page, privateKey, request)
        const publicKeyContainer = await page.waitForSelector(`id=header-property-publicKey`)
        const publicKeyText = await publicKeyContainer?.innerText()

        expect(publicKeyText.slice(0, 24)).toBe(key.slice(0, 24))

        await page.hover('id=button-transact')
        const avAmount = await page.waitForSelector(`id=header-available-balance`)
        const lockedAmount = await page.waitForSelector(`id=header-locked-balance`)

        expect(await avAmount.innerText()).toBe('324100')
        expect(await lockedAmount.innerText()).toBe('31000')

        await page.getByRole('button', { name: 'Create new ask' }).click()
        await page.getByLabel('Title').click()
        await page.getByLabel('Title').fill('This is test Created')
        await page.getByLabel('Title').press('Tab')
        await page.getByLabel('Amount').fill('2500')
        await page.getByLabel('Amount').press('Tab')
        await page.getByRole('combobox', { name: 'Select an option' }).selectOption('BUMP_PUBLIC')
        await page.locator('input[type="file"]').setInputFiles('./public/testimage.png')
        await page.getByRole('img', { name: 'uploaded image' }).click()
        await page.getByRole('button', { name: 'Submit' }).click()

        await page.reload()

        await page.hover('id=button-transact')
        const avAmount2 = await page.waitForSelector(`id=header-available-balance`)
        const lockedAmount2 = await page.waitForSelector(`id=header-locked-balance`)

        expect(await avAmount2.innerText()).toBe('321600')
        expect(await lockedAmount2.innerText()).toBe('33500')

        await page.locator('input[name="amount"]').first().fill('1500')
        await page.getByRole('button', { name: 'Bump with' }).first().click()

        await page.locator('input[name="amount"]').first().fill('2600')
        await page.getByRole('button', { name: 'Bump with' }).first().click()

        await page.locator('input[name="amount"]').first().fill('3600')
        await page.getByRole('button', { name: 'Bump with' }).first().click()

        await page.reload()

        await page.hover('id=button-transact')
        const avAmount3 = await page.waitForSelector(`id=header-available-balance`)
        const lockedAmount3 = await page.waitForSelector(`id=header-locked-balance`)

        expect(await avAmount3.innerText()).toBe('313900')
        expect(await lockedAmount3.innerText()).toBe('41200')
    })

    test('transaction test two', async ({ page, request }) => {
        const btcWIF = new BitcoinWIF('testnet')
        await page.goto('/')

        const seed = await bip39
            .mnemonicToSeed(wallets[0]?.mnemonic ?? '')
            .then((value: Buffer) => value.toString('hex'))
        const privateKey = btcWIF.privateKey(seed)

        const key = await createUser(page, privateKey, request)
        const publicKeyContainer = await page.waitForSelector(`id=header-property-publicKey`)
        const publicKeyText = await publicKeyContainer?.innerText()

        expect(publicKeyText.slice(0, 24)).toBe(key.slice(0, 24))

        await page.hover('id=button-transact')
        const avAmount = await page.waitForSelector(`id=header-available-balance`)
        const lockedAmount = await page.waitForSelector(`id=header-locked-balance`)

        expect(await avAmount.innerText()).toBe('313900')
        expect(await lockedAmount.innerText()).toBe('41200')

        await page.getByRole('button', { name: 'Create new ask' }).click()
        await page.getByLabel('Title').click()
        await page.getByLabel('Title').fill('This task should be interacted with')
        await page.getByLabel('Title').press('Tab')
        await page.getByLabel('Amount').fill('3500')
        await page.getByLabel('Amount').press('Tab')
        await page.getByRole('combobox', { name: 'Select an option' }).selectOption('PUBLIC')
        await page.locator('input[type="file"]').setInputFiles('./public/testimage.png')
        await page.getByRole('img', { name: 'uploaded image' }).click()
        await page.getByRole('button', { name: 'Submit' }).click()

        await page.reload()

        await page.hover('id=button-transact')
        const avAmount2 = await page.waitForSelector(`id=header-available-balance`)
        const lockedAmount2 = await page.waitForSelector(`id=header-locked-balance`)

        expect(await avAmount2.innerText()).toBe('310400')
        expect(await lockedAmount2.innerText()).toBe('44700')

        // Second user

        await page.click('id=logout-button')

        const seed2 = await bip39
            .mnemonicToSeed(wallets[1]?.mnemonic ?? '')
            .then((value: Buffer) => value.toString('hex'))
        const privateKey2 = btcWIF.privateKey(seed2)

        const key2 = await createUser(page, privateKey2, request)
        const publicKeyContainer2 = await page.waitForSelector(`id=header-property-publicKey`)
        const publicKeyText2 = await publicKeyContainer2?.innerText()

        expect(publicKeyText2.slice(0, 24)).toBe(key2.slice(0, 24))

        await page.hover('id=button-transact')
        const avAmountB1 = await page.waitForSelector(`id=header-available-balance`)
        const lockedAmountB1 = await page.waitForSelector(`id=header-locked-balance`)

        expect(await avAmountB1.innerText()).toBe('324100')
        expect(await lockedAmountB1.innerText()).toBe('31000')

        // Second user interact with ask

        await page.getByText('This task should be interacted with').click()

        await page.getByRole('button', { name: 'Add Offer (0)' }).click()
        await page.locator('input[type="file"]').setInputFiles('./public/testimage.png')
        await page
            .getByRole('combobox', { name: 'Select an obscure method Select a blur level' })
            .selectOption('CHECKER')

        await page.getByRole('button', { name: 'Submit' }).click()

        // First user logs in and favourites the offer

        await page.click('id=logout-button')

        await page.goto('/')

        const key3 = await createUser(page, privateKey, request)
        const publicKeyContainer3 = await page.waitForSelector(`id=header-property-publicKey`)
        const publicKeyText3 = await publicKeyContainer3?.innerText()

        expect(publicKeyText3.slice(0, 24)).toBe(key3.slice(0, 24))

        await page.getByText('This task should be interacted with').click()

        await page.click('id=favourite-trigger')

        const url = page.url()
        const askContext = await testPrisma.askContext.findUnique({ where: { slug: url.split('/')[5] } })
        const ask = await testPrisma.ask.findUnique({ where: { id: askContext?.askId } })
        const backTime = { days: 10, hours: 1 }
        const updatedAsk = await testPrisma.ask.update({
            where: { id: askContext?.askId },
            data: {
                createdAt: sub(ask?.createdAt ?? new Date(), backTime),
                deadlineAt: sub(ask?.deadlineAt ?? new Date(), backTime),
                acceptedDeadlineAt: sub(ask?.acceptedDeadlineAt ?? new Date(), backTime),
            },
        })

        await page.goto('/')

        const indicatorContainer = await page.locator('id=ask-preview-host', {
            has: page.getByText('This task should be interacted with'),
        })

        const indicator = indicatorContainer.locator('id=settled-indicator')

        expect(await indicator.innerText()).toBe('BUMP WITH')

        await new Promise((resolve) => setTimeout(resolve, 10000))
    })
})
