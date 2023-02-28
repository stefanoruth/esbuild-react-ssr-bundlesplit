import express from 'express'
import path from 'path'
import fs from 'fs/promises'
import { App } from '../app'
import { StaticRouter } from 'react-router-dom/server'
import { FetchClient, FetchContext, memCache } from '@stefanoruth/fetch-hooks'
// import { getInitialState } from '@stefanoruth/fetch-hooks/server'
import { renderToStaticNodeStream, renderToPipeableStream } from 'react-dom/server'
import { ReactElement } from 'react'

const app = express()

app.use('/assets', express.static(path.join(__dirname, '../../dist/client')))

export async function getInitialState(options: { App: ReactElement; client: FetchClient }): Promise<any> {
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

        const serverApp = (
            <FetchContext.Provider value={fetchClient}>
                <StaticRouter location={req.originalUrl}>
                    <App />
                </StaticRouter>
            </FetchContext.Provider>
        )

        const initialState = await getInitialState({ App: serverApp, client: fetchClient })

        const initialStateScript = `window.__INITIAL_STATE__=${JSON.stringify(initialState).replace(/</g, '\\u003c')};`

        let didError = false
        const { pipe } = renderToPipeableStream(serverApp, {
            bootstrapScriptContent: initialStateScript,
            bootstrapModules: [manifest.main.js],
            onShellReady: async () => {
                res.setHeader('content-type', 'text/html')
                res.status(didError ? 500 : 200)
                pipe(res)
            },
            onShellError(error) {
                // console.error(error)l
                res.statusCode = 500
                res.setHeader('content-type', 'text/html')
                res.send('<h1>Something went wrong</h1>')
            },
            onError(error) {
                console.error(error)
                didError = true
                res.statusCode = 500
                res.setHeader('content-type', 'text/html')
                res.send('<h1>Something went wrong</h1>')
            },
        })
    } catch (error) {
        console.error(error)
        return next(error)
    }
})

app.listen(3000, () => console.log('http://localhost:3000'))
