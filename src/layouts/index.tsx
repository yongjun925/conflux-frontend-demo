
require('./index.css')
import styles from './index.less';


export default (props: any) => {
    return (
        <div id="app" className={styles.wrap}>
            {props.children}
        </div>
    );
}

