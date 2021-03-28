import { Button, WhiteSpace, NavBar, Icon } from 'antd-mobile';
import { useState } from 'react';
import styles from '../index.less';

export interface IProps {
  account: string
  balance: string
  navClickHandler: () => void
}

export default (props: IProps) => {

  const { account, balance, navClickHandler } = props

  const [visible, setVisible] = useState(false);

  const navAccountView = () => {
    return (
      <>
        <span onClick={() => setVisible(!visible)} className={styles.accountAddress}>{account.slice(0, 16) + '...'}<Icon type="down" size="xs" /></span>
      </>
    )
  }

  return (
    <div className={styles.header}>
      <NavBar
        mode="light"
        onClick={navClickHandler}
      >{account ? navAccountView() : <Button loading size="small">连接钱包</Button>}</NavBar>
      {
        visible && <div className={styles.account}>
          钱包地址：{account}
          <WhiteSpace />
            CFX：{balance}
        </div>
      }
    </div>
  );
}

