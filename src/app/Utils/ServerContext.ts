import { createContext, useContext } from 'react'

export interface ServerConfig {
    statusCode?: number
}

export const ServerConfigContext = createContext<ServerConfig>({})

export const useServer = () => {
    const context = useContext(ServerConfigContext)

    return {
        setStatusCode: (code: number) => {
            context.statusCode = code
        },
    }
}
