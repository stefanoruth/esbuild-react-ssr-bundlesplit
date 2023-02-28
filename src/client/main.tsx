import { hydrateRoot } from 'react-dom/client'
import { App } from '../app'
import { FetchClient, FetchContext, memCache } from '@stefanoruth/fetch-hooks'
import { BrowserRouter } from 'react-router-dom'

const fetchClient = new FetchClient({
    baseUrl: 'http://localhost:3000',
    cache: memCache({ initialState: (window as any).__INITIAL_STATE__ }),
})

hydrateRoot(
    document,
    <FetchContext.Provider value={fetchClient}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </FetchContext.Provider>
)
