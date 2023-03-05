import { useFetch } from '@stefanoruth/fetch-hooks'

const SplitRemoteItem: React.FunctionComponent = () => {
    const { data, error } = useFetch<{ text: string }>('https://cat-fact.herokuapp.com/facts/random')

    if (error) {
        return <pre>{JSON.stringify(error, null, 2)}</pre>
    }

    return <div>SplitRemoteItem: {data?.text || 'Not fetched'}</div>
}

export default SplitRemoteItem
