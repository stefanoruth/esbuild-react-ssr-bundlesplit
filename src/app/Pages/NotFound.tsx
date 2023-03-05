import { useServer } from '../Utils'

export const NotFound: React.FunctionComponent = props => {
    const { setStatusCode } = useServer()

    setStatusCode(404)

    return <div>Page Missing</div>
}
