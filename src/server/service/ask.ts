import {
    ACTIVE_SELECT,
    ALL_SELECT,
    EXPIRED_SELECT,
    PENDING_ACCEPTANCE_SELECT,
    programmaticActive,
    programmaticExpired,
    programmaticPendingAcceptance,
    programmaticSettled,
    SETTLED_SELECT,
} from '~/server/service/selects'
import { Prisma, Tag } from '@prisma/client'

export type AskStatus = 'active' | 'pending_acceptance' | 'settled' | 'expired' | 'no_status'

export const getAskStatus = (
    deadlineAt: Date,
    acceptedAt: Date,
    hasAnyOffers: boolean,
    hasFavouriteOffer: boolean,
): AskStatus => {
    if (programmaticActive(deadlineAt)) {
        return 'active'
    }
    if (programmaticExpired(deadlineAt, hasAnyOffers, acceptedAt, hasFavouriteOffer)) {
        return 'expired'
    }
    if (programmaticPendingAcceptance(deadlineAt, acceptedAt, hasAnyOffers, hasFavouriteOffer)) {
        return 'pending_acceptance'
    }
    if (programmaticSettled(deadlineAt, hasFavouriteOffer)) {
        return 'settled'
    }
    return 'no_status'
}

export const getOrder = (orderBy: 'deadline' | 'acceptance' | 'creation', orderByDirection: 'asc' | 'desc') => {
    return {
        deadline: { deadlineAt: orderByDirection },
        acceptance: { acceptedDeadlineAt: orderByDirection },
        creation: { createdAt: orderByDirection },
    }[orderBy]
}

export const getFilter = (filter: 'active' | 'pending_acceptance' | 'settled' | 'expired' | 'all') => {
    return {
        active: ACTIVE_SELECT,
        expired: EXPIRED_SELECT,
        pending_acceptance: PENDING_ACCEPTANCE_SELECT,
        settled: SETTLED_SELECT,
        all: ALL_SELECT,
    }[filter] as Prisma.AskWhereInput
}

export const getSearch = (filter: string) => {
    return filter
        ? {
              askContext: {
                  title: {
                      search: filter.trim().split(' ').join(' <-> '),
                  },
              },
          }
        : {}
}

export const byUser = (userName: string | undefined | null) => {
    return userName
        ? {
              user: { userName: userName },
          }
        : {}
}

export const byAskKind = (askKind: string | undefined | null) => {
    return askKind
        ? {
              askKind: askKind,
          }
        : {}
}

export const equalsList = (list: Array<string>) => {
    return list.map((item) => {
        return {
            name: {
                equals: item,
            },
        }
    })
}

export const byTags = (tags: Array<Partial<Tag>>, role: 'USER' | 'GUEST' | 'ADMIN', singleTag?: string | null) => {
    return singleTag
        ? {
              tags: {
                  some: {
                      tag: {
                          name: singleTag,
                      },
                  },
                  none: {
                      tag: {
                          OR: equalsList(tags.map((tag) => tag.name ?? '')),
                      },
                  },
              },
          }
        : {
              tags: {
                  none: {
                      tag: {
                          OR: equalsList(tags.map((tag) => tag.name ?? '')),
                      },
                  },
              },
          }
}

export const byHasFavouriteOffer = (filter: boolean) => {
    return filter
        ? {
              favouriteOffer: null,
          }
        : {}
}
