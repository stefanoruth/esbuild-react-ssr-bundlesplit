import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home } from './Pages'

export const App: React.FunctionComponent = () => {
    return (
        <html lang="en">
            <head>
                <title>Text</title>
            </head>
            <body>
                <div id="app">
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </div>
            </body>
        </html>
    )
}
