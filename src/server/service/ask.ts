import { Tag } from '@prisma/client'

export const getOrder = (orderBy: 'deadline' | 'acceptance' | 'creation', orderByDirection: 'asc' | 'desc') => {
    return {
        deadline: { deadlineAt: orderByDirection },
        acceptance: { acceptedDeadlineAt: orderByDirection },
        creation: { createdAt: orderByDirection },
    }[orderBy]
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
