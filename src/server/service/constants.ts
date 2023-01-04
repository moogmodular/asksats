export const MIN_INVOICE_FLOOR = 10
export const MIN_WITHDRAWAL_FLOOR = 10
export const SINGLE_TRANSACTION_CAP = 5000
export const PER_USER_BALANCE_CAP = 50000
export const MSATS_UNIT_FACTOR = 1000
export const TRANSACTION_FREQUENCY_SECONDS_LIMIT = 60
export const TRANSACTION_MAX_AGE = 60 * 60
export const INVOICE_LIMIT = 10
export const BUMP_PUBLIC_MIN_BUMP_FACTOR = 0.1
export const GLOBAL_MIN_BUMP_SATS = 10
export const THE_BANK = 0.09
export const PAYOUT_FACTOR = 1 - THE_BANK
export const DEFAULT_EXCLUDED_TAG = [{ name: 'nsfw', id: '' }]
export const askTextDefault =
    'Describe your Ask here... click on the *preview* tab to see how it will be displayed. You can use **markdown** ([cheat sheet](https://www.markdownguide.org/cheat-sheet/)) and if you need more than one image to describe it you can use external images like: ![imgae from wikipedia](https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png)'
export const offerTextDefault =
    'Describe your Offer here... click on the *preview* tab to see how it will be displayed. You can use **markdown** ([cheat sheet](https://www.markdownguide.org/cheat-sheet/)) and use external images like: ![imgae from wikipedia](https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png) but only the uploaded images will be **OBFUSCATED**.'
