import { Button, InputItem, List, Modal, Toast } from 'antd-mobile';
import { useState } from 'react';
import * as _ from 'lodash'
import { format } from 'js-conflux-sdk';
import styles from '../index.less';

const Item = List.Item;
const Brief = Item.Brief;

export interface IProps {
    funs: object[]
    selectedIndex: number
    contractSubmitHandler: (fun: any, params: string[]) => void
}

export default (props: IProps) => {

    const { funs, selectedIndex, contractSubmitHandler } = props
    const [visible, setVisible] = useState(false);
    const [fun, setFun] = useState({} as any);
    const [formData, setFormData] = useState({} as any);

    const itemClickHandler = (fun: any) => {
        setFun(fun)
        const obj: any = {}
        _.forEach(fun.inputs, input => {
            obj[input.name] = ''
        })
        setFormData(obj)
        setVisible(true)
    }

    const submitBtnLabel = () => {
        let label
        switch (selectedIndex) {
            case 0:
                label = '查询'
                break;
            case 1:
                label = '发送'
                break;
            case 2:
                label = '查询事件日志'
                break;
        }
        return (label)
    }

    const inputHandler = (name: string, val: string) => {
        formData[name] = val
        setFormData(formData)
    }

    const submitHandler = () => {
        if (fun.inputs && selectedIndex !== 2) {
            const params = []
            for (const input of fun.inputs) {
                const val = formData[input.name]
                if (!val) return Toast.fail(`请输入${input.name}`, 2);
                if (input.type === 'address') {
                    let newAddr
                    try {
                        newAddr = format.address(val)
                    } catch (error) {
                        return Toast.fail('请正确地址', 2);
                    }
                }
                params.push(val)
            }
            contractSubmitHandler(fun, params)
        }
    }

    return (
        <div>
            <div style={{ paddingTop: 15, paddingBottom: 15 }}>
                <List>
                    {
                        funs.map((fun: any) => {
                            return (
                                <Item key={`form-${fun.name}`} arrow="horizontal" multipleLine onClick={() => { itemClickHandler(fun) }}>
                                    {fun.name} <Brief></Brief>
                                </Item>
                            )
                        })
                    }
                </List>
                <Modal
                    popup
                    visible={visible}
                    onClose={() => setVisible(false)}
                    animationType="slide-up"
                    wrapClassName="modalWrap"
                >
                    <List renderHeader={() => <div>{fun.name}</div>} className="popup-list">
                        {
                            (fun.inputs && selectedIndex !== 2) && fun.inputs.map((input: any) => {
                                return (
                                    <InputItem
                                        key={`form-${fun.name}-${input.name}`}
                                        clear
                                        placeholder={input.type}
                                        onChange={val => inputHandler(input.name, val)}
                                    >{input.name}</InputItem>
                                )
                            })
                        }
                        <Item>
                            <Button type="primary" onClick={submitHandler}>{submitBtnLabel()}</Button>
                        </Item>
                    </List>
                </Modal>
            </div>
        </div>
    );
}

