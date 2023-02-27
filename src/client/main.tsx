import { hydrateRoot } from 'react-dom/client'
import { App } from '../app'
import { FetchClient, FetchContext, memCache } from '@stefanoruth/fetch-hooks'

const fetchClient = new FetchClient({
    baseUrl: 'http://localhost:3000',
    cache: memCache({ initialState: (window as any).__INITIAL_STATE__ }),
})

const app = document.getElementById('app')

if (app) {
    hydrateRoot(
        app,
        <FetchContext.Provider value={fetchClient}>
            <App />
        </FetchContext.Provider>
    )
}
