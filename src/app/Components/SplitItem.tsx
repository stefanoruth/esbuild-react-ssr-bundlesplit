import styles from './SplitItem.module.css'
import styles2 from './SplitItem2.module.css'

const SplitItem: React.FunctionComponent = () => {
    return <div className={styles.text + ' ' + styles2.textB}>Split Item</div>
}

export default SplitItem
