import express from 'express'
import path from 'path'
import fs from 'fs/promises'
import { App } from '../app'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { FetchClient, FetchContext, memCache } from '@stefanoruth/fetch-hooks'
import { getInitialState } from '@stefanoruth/fetch-hooks/server'
import { renderToStaticNodeStream, renderToNodeStream, renderToPipeableStream } from 'react-dom/server'

const app = express()

app.use('/assets', express.static(path.join(__dirname, '../../dist/client')))

function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Buffer[] = []
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(Buffer.from(chunk)))
        stream.on('error', err => reject(err))
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
}

app.use('/favicon.ico', (req, res) => res.status(404).end())

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

        console.log(manifest.main.js)

        const { pipe } = renderToPipeableStream(serverApp, {
            bootstrapScriptContent: initialStateScript,
            bootstrapModules: [manifest.main.js],
            onAllReady: async () => {
                //     res.write(` <html lang="en">
                // <head>
                //     <meta charSet="UTF-8" />
                //     <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                //     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                //     <title>ESBuild - React - TypeScript - SSR - BundleSplit</title>
                // </head>
                // <body><div id="app">`)

                // res.write('<div id="app">')

                pipe(res)

                // res.write('</>')
                // res.end()

                //                 res.write(`</div>
                //     </body>
                // </html>`)
                //                 res.end()
            },
        })
    } catch (error) {
        console.error(error)
        return next(error)
    }
})

app.listen(3000, () => console.log('http://localhost:3000'))
