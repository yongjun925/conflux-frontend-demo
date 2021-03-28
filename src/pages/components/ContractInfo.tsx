import { Button, InputItem, List, Toast } from 'antd-mobile';
import { useState } from 'react';
import MonacoEditor from 'react-monaco-editor'
import { format } from 'js-conflux-sdk';
import * as _ from 'lodash'
import styles from '../index.less';

const Item = List.Item;

export interface IProps {
    contractInfoSubmit: (addr: string, abi: object[]) => void
}

export default (props: IProps) => {

    const { contractInfoSubmit } = props
    const [addr, setAddr] = useState('');
    const [abi, setAbi] = useState('');

    const options = {
        selectOnLineNumbers: true
    }

    const codeChangeHandler = (newValue: string) => {
        setAbi(newValue)
    }

    const submitClickHandler = () => {
        if (!addr || !abi) {
            return Toast.fail('请输入合约地址和ABI', 2);
        }
        let newAddr
        try {
            newAddr = format.address(addr)
        } catch (error) {
            return Toast.fail('请正确合约地址', 2);
        }
        let newAbi
        try {
            newAbi = JSON.parse(abi)
        } catch (error) {
            return Toast.fail('请正确ABI信息', 2);
        }
        const abiTable = _.groupBy(newAbi, 'type')
        console.log('abiTable', abiTable)
        if (!abiTable || (!abiTable.function && !abiTable.event)) {
            return Toast.fail('请正确ABI信息', 2);
        }
        contractInfoSubmit(addr, newAbi)
    }

    return (
        <div className={styles.contractInfo}>
            <h3>输入合约地址和ABI</h3>
            <List>
                <InputItem
                    clear
                    placeholder="合约地址"
                    onChange={val => setAddr(val)}
                >地址</InputItem>
                <Item extra={<MonacoEditor
                    height="300"
                    theme="vs-dark"
                    language="json"
                    value={abi}
                    options={options}
                    onChange={codeChangeHandler}
                />}>ABI</Item>
            </List>
            <Button type="primary" onClick={submitClickHandler}>连接合约</Button>
        </div>
    );
}

