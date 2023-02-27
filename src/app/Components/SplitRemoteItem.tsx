import { useFetch } from '@stefanoruth/fetch-hooks'

const SplitRemoteItem: React.FunctionComponent = () => {
    const { data } = useFetch<{ text: string }>('https://cat-fact.herokuapp.com/facts/random')

    return <div>SplitRemoteItem: {data?.text || 'Not fetched'}</div>
}

export default SplitRemoteItem
