import { isAfter, isBefore } from 'date-fns'

export const ACTIVE_SELECT = {
    deadlineAt: {
        gte: new Date(),
    },
}
export const EXPIRED_SELECT = {
    OR: [
        { AND: [{ deadlineAt: { lte: new Date() } }, { offer: { none: {} } }] },
        { AND: [{ acceptedDeadlineAt: { lte: new Date() } }, { favouriteOffer: null }] },
    ],
}
export const PENDING_ACCEPTANCE_SELECT = {
    AND: [
        { deadlineAt: { lte: new Date() } },
        { acceptedDeadlineAt: { gte: new Date() } },
        { offer: { some: {} } },
        { favouriteOffer: null },
    ],
}
export const SETTLED_SELECT = {
    AND: [{ deadlineAt: { lte: new Date() } }, { offer: { some: {} } }, { favouriteOffer: { is: {} } }],
}
export const ALL_SELECT = {}

export const programmaticActive = (deadlineAt: Date) => isAfter(deadlineAt, new Date())

export const programmaticExpired = (
    deadlineAt: Date,
    hasAnyOffers: boolean,
    acceptedAt: Date,
    hasFavouriteOffer: boolean,
) => (isBefore(deadlineAt, new Date()) && !hasAnyOffers) || (isBefore(acceptedAt, new Date()) && !hasFavouriteOffer)

export const programmaticPendingAcceptance = (
    deadlineAt: Date,
    acceptedAt: Date,
    hasAnyOffers: boolean,
    hasFavouriteOffer: boolean,
) => isBefore(deadlineAt, new Date()) && isAfter(acceptedAt, new Date()) && hasAnyOffers && !hasFavouriteOffer

export const programmaticSettled = (deadlineAt: Date, hasFavouriteOffer: boolean) =>
    isBefore(deadlineAt, new Date()) && hasFavouriteOffer
