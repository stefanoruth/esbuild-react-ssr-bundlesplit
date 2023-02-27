import { Suspense } from 'react'
import { NormalItem, SplitItem, SplitRemoteItem } from '../Components'

export const Home: React.FunctionComponent = () => {
    return (
        <ul>
            <li>
                <NormalItem />
            </li>
            <li>
                <SplitItem />
            </li>
            <li>
                <Suspense fallback={<div>Loading</div>}>
                    <SplitRemoteItem />
                </Suspense>
            </li>
        </ul>
    )
}
