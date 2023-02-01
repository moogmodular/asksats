import { adjectives, animals, colors, Config, uniqueNamesGenerator } from 'unique-names-generator'

export const defaultUserData = async () => {
    const customConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: '',
        length: 3,
        style: 'capital',
    }
    const randomName: string = uniqueNamesGenerator(customConfig)

    const response = await fetch('https://source.unsplash.com/random/250×250')
    const image = await fetch(response.url)
        .then((r) => r.arrayBuffer())
        .then((b) => Buffer.from(b).toString('base64'))
    return { randomName, image }
}
