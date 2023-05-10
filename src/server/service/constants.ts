export const MIN_INVOICE_FLOOR = 10
export const MIN_WITHDRAWAL_FLOOR = 10
export const SINGLE_TRANSACTION_CAP = 10000
export const PER_USER_BALANCE_CAP = 60000
export const MSATS_UNIT_FACTOR = 1000
export const TRANSACTION_FREQUENCY_SECONDS_LIMIT_IN = 60
export const TRANSACTION_FREQUENCY_SECONDS_LIMIT_OUT = 60 * 10
export const TRANSACTION_MAX_AGE = 60 * 60
export const ASK_EDITABLE_TIME = 60 * 60 * 3
export const INVOICE_LIMIT = 10
export const WITHDRAWAL_LIMIT = 3
export const SPACE_CREATION_COST = 1000
export const BUMP_PUBLIC_MIN_BUMP_FACTOR = 0.1
export const GLOBAL_MIN_BUMP_SATS = 10
export const THE_BANK = 0.06
export const SPACE_OWNER = 0.03
export const PAYOUT_FACTOR = 1 - THE_BANK - SPACE_OWNER
export const askTextDefault =
    'Describe your Ask here... click on the *preview* tab to see how it will be displayed. You can use **markdown** ([cheat sheet](https://www.markdownguide.org/cheat-sheet/)) and if you need more than one image to describe it you can use external images like: ![imgae from wikipedia](https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png)'
export const offerTextDefault =
    'Describe your Offer here... click on the *preview* tab to see how it will be displayed. You can use **markdown** ([cheat sheet](https://www.markdownguide.org/cheat-sheet/)) and use external images like: ![imgae from wikipedia](https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png) but only the uploaded images will be **OBFUSCATED**.'
export const bumpInfoText =
    '**Private:** this ask cannot be bumped by other users and if such an ask gets successfully settled only the author of the ask gets to see the unobfuscated image or media item.\n' +
    '\n' +
    '**Public:** these asks can be bumped by every user and if they settle successfully every other user on the site gets to see and to download the unobfuscated image. The image is given to the community.\n' +
    '\n' +
    '**Bump Public:** these asks are similar to public asks but only users that posted a bump (with at least 10% of the current sum) get to see the final image upon successful settlement. the choice of the favourite is stil in the hands of the original ask author.'

export const privateInfoText =
    'Private: this ask cannot be bumped by other users and if such an ask gets successfully settled only the author of the ask gets to see the unobfuscated image or media item.'
export const publicInfoText =
    '**Public:** these asks can be bumped by every user and if they settle successfully every other user on the site gets to see and to download the unobfuscated image. The image is given to the community.'
export const bumpPublicInfoText =
    '**Bump Public:** these asks are similar to public asks but only users that posted a bump (with at least 10% of the current sum) get to see the final image upon successful settlement. the choice of the favourite is stil in the hands of the original ask author.'
