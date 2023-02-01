import { expect, test } from '@playwright/test'
import { authenticateNewUser, deleteUser } from './test-utils'

test.setTimeout(35e3)
test.describe('user', async () => {
    test('user edits his profile', async ({ page, request }) => {
        await page.goto('/')

        const key = await authenticateNewUser(page, request)

        const publicKeyContainer = await page.waitForSelector(`id=header-property-publicKey`)
        const publicKeyText = await publicKeyContainer?.innerText()

        expect(publicKeyText.slice(0, 24)).toBe(key.slice(0, 24))

        await page.click('id=button-edit-profile')

        const targetName = `Vicious${new Date().getTime().toString().slice(0, 4)}`
        const targetBio = 'Hi i am a new test user.'

        await page.getByLabel('user name').fill(targetName)
        await page.getByLabel('bio').fill(targetBio)
        await page.click('id=edit-profile-submit')

        await new Promise((resolve) => setTimeout(resolve, 1000))

        await page.reload()

        const updatedUserNameText = await page
            .waitForSelector(`id=header-property-userName`)
            .then((value) => value.innerText())

        expect(updatedUserNameText).toBe('@' + targetName.slice(0, 14))

        await deleteUser(page)
    })
})
