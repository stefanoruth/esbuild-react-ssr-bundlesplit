import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home, NotFound } from './Pages'

export const App: React.FunctionComponent = () => {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>ESBuild - React - TypeScript - SSR - BundleSplit</title>
            </head>
            <body>
                <div id="app">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </body>
        </html>
    )
}
