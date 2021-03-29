import { useState, useEffect } from 'react';
import { List, WingBlank, SegmentedControl, Toast, Modal } from 'antd-mobile';
import Big from 'big.js'
import { address, Conflux, format } from 'js-conflux-sdk';
import confluxPortal from '../lib/conflux-portal'
import * as _ from 'lodash'
import styles from './index.less';

import Header from './components/Header'
import ContractInfo from './components/ContractInfo'
import ContractMethods from './components/ContractMethods'

// const abiCoin = require('../lib/abi/Coin.json')
const conflux = new Conflux({
  url: confluxPortal.conflux && confluxPortal.conflux.networkVersion === 2 ? 'https://main.confluxrpc.org/v2' : 'https://test.confluxrpc.org/v2',
  networkId: 1
})

enum Status {
  PORTAL_STATE_DISCONNECTED,
  PORTAL_STATE_CONNECTING,
  PORTAL_STATE_CONNECTED
}

function openUrl(id: string, url: string) {
  var a = document.createElement('a');
  a.setAttribute('href', url)
  a.setAttribute('target', '_blank')
  a.setAttribute('id', id)
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function IndexPage() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState(1);
  const [balance, setBalance] = useState('');
  const [contract, setContract] = useState({} as any);
  const [funs, setFuns] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState('');
  const [abi, setAbi] = useState([] as object[]);

  useEffect(() => {
    connectConfluxPortal()
  }, []);

  const connectConfluxPortal = async () => {
    if (!confluxPortal.conflux) return
    setStatus(Status.PORTAL_STATE_CONNECTING)
    await confluxPortal.enable()
    const account = confluxPortal.getAccount()
    setAccount(account)
    setStatus(Status.PORTAL_STATE_CONNECTED)
    setBalance('')
    refreshBalance(account)
  }

  const refreshBalance = async (account: string) => {
    if (!account) {
      return
    }
    setBalance('')
    const balance = await conflux.getBalance(account)
    console.log('balance', balance.toString())
    setBalance(new Big(balance.toString()).div(1e18).toFixed(5))
  }

  const navClickHandler = () => {
    if (!confluxPortal.conflux) return openUrl('appurl', confluxPortal.getInstallUrl())
    if (!account) connectConfluxPortal()
  }

  const contractInfoSubmit = (addr: string, abi: object[]) => {
    const contract: any = conflux.Contract({
      abi,
      address: addr,
    })
    console.log('contract', contract)
    setContract(contract)
    setAbi(abi)
    refreshMethods(abi, selectedIndex)
  }

  const selectedIndexChange = (e: any) => {
    refreshMethods(abi, e.nativeEvent.selectedSegmentIndex)
  }

  const refreshMethods = (abi: object[], index: number) => {
    const abiTable: any = _.groupBy(abi, 'type')
    let arr: any
    switch (index) {
      case 0:
        arr = _.filter(abiTable.function, method => method.stateMutability !== 'view')
        setFuns(arr)
        setSelectedIndex(0)
        break
      case 1:
        arr = _.filter(abiTable.function, method => method.stateMutability === 'view')
        setFuns(arr)
        setSelectedIndex(1)
        break
      case 2:
        setFuns(abiTable.event)
        setSelectedIndex(2)
        break
    }
  }

  const contractSubmitHandler = async (fun: any, params: any) => {
    try {
      if (!contract || !contract[fun.name]) return Toast.fail('合约或合约方法不存在', 2);
      console.log('contractSubmitHandler', contract[fun.name], fun, params)
      if (selectedIndex === 0) {
        const called = contract[fun.name].call(...params)
        const result: any = await confluxPortal.sendTransaction({
          from: confluxPortal.getAccount(),
          to: called.to,
          data: called.data,
        })
        if (!result.result) return Toast.fail('交易失败', 2);
        console.log('result', result)
        // const transaction: any = await conflux.getTransactionByHash(result.result)
        // console.log('transaction', transaction, JSON.stringify(transaction.map((x: any) => ({ epoch: x.epochNumber, ...x.params.object })), null, 2))
        setResult(result.result)
        setModalVisible(true)
      } else if (selectedIndex === 1) {
        const result = await contract[fun.name].call(...params)
        console.log('result', result)
        setResult(result.toString())
        setModalVisible(true)
      }
    } catch (error) {
      Toast.fail(error.message, 3);
    }
  }

  return (
    <div>
      <Header
        account={account}
        balance={balance}
        navClickHandler={navClickHandler}
      />
      <div style={{ marginTop: 45 }}>
        <WingBlank style={{ paddingTop: 10 }}>
          <ContractInfo
            contractInfoSubmit={contractInfoSubmit}
          />
          <SegmentedControl onChange={selectedIndexChange} selectedIndex={selectedIndex} values={['写入', '读取', '事件']} />
          <ContractMethods funs={funs} selectedIndex={selectedIndex} contractSubmitHandler={contractSubmitHandler} />
          <Modal
            visible={modalVisible}
            transparent
            maskClosable={false}
            onClose={() => setModalVisible(false)}
            title="结果"
            footer={[{ text: 'Ok', onPress: () => { setModalVisible(false) } }]}
          >
            <div style={{ height: 100, overflow: 'scroll' }}>
              {result}
            </div>
          </Modal>
        </WingBlank>
      </div>
    </div>
  );
}

