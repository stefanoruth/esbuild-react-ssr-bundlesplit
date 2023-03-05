import express from 'express'
import path from 'path'
import fs from 'fs/promises'
import { App, ServerConfig, ServerConfigContext } from '../app'
import { StaticRouter } from 'react-router-dom/server'
import { FetchClient, FetchContext, memCache } from '@stefanoruth/fetch-hooks'
// import { getInitialState } from '@stefanoruth/fetch-hooks/server'
import { renderToStaticNodeStream, renderToPipeableStream } from 'react-dom/server'
import { ReactElement } from 'react'

const app = express()

app.use('/assets', express.static(path.join(__dirname, '../../dist/client')))

export async function getInitialState(options: { App: ReactElement; client: FetchClient }): Promise<object> {
    const { App, client } = options

    client.ssrMode = true

    await streamToString(renderToStaticNodeStream(App))

    if (client.ssrPromises.length > 0) {
        await Promise.all(client.ssrPromises)
        // clear promises
        client.ssrPromises = []

        // recurse there may be dependant queries
        return getInitialState(options)
    } else {
        return client.getInitialState()
    }
}

function streamToString(stream: NodeJS.ReadableStream) {
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => {
            // Do nothing.
        })
        stream.on('error', reject)
        stream.on('end', resolve)
    })
}

app.use('/favicon.ico', (req, res) => res.end())

app.use(async (req, res, next) => {
    if (req.method !== 'GET') {
        return next()
    }

    try {
        const fetchClient = new FetchClient({
            baseUrl: 'http://localhost:3000',
            cache: memCache(),
            ssrMode: true,
        })

        const manifest = JSON.parse(
            (await fs.readFile(path.join(__dirname, '../client/manifest.json'))).toString('utf-8')
        )

        const context: ServerConfig = {}

        const serverApp = (
            <ServerConfigContext.Provider value={context}>
                <FetchContext.Provider value={fetchClient}>
                    <StaticRouter location={req.originalUrl}>
                        <App />
                    </StaticRouter>
                </FetchContext.Provider>
            </ServerConfigContext.Provider>
        )

        let initialState: object = {}

        try {
            initialState = await getInitialState({ App: serverApp, client: fetchClient })
        } catch (error) {
            // This error is generated and catched again further down the line.
        }

        const initialStateScript = `window.__INITIAL_STATE__=${JSON.stringify(initialState).replace(/</g, '\\u003c')};`

        const { pipe } = renderToPipeableStream(serverApp, {
            bootstrapScriptContent: initialStateScript,
            bootstrapModules: [manifest.main.js],
            onShellReady: async () => {
                res.status(context.statusCode || 200)
                res.setHeader('content-type', 'text/html')

                pipe(res)
            },
            onShellError(error) {
                res.statusCode = 500

                res.setHeader('content-type', 'text/html')
                res.write(`<h1>Something went wrong</h1>`)

                if (error instanceof Error) {
                    res.write(`<pre>${error.stack}</pre>`)
                }

                res.end()
            },
            onError(error) {
                console.error(error)
            },
        })
    } catch (error) {
        console.error(error)
        return next(error)
    }
})

app.listen(3000, () => console.log('http://localhost:3000'))
