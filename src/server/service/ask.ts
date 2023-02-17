export const getOrder = (orderBy: 'creation', orderByDirection: 'asc' | 'desc') => {
    return {
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
