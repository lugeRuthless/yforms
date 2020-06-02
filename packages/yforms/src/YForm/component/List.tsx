import React, { useEffect } from 'react';
import { Form } from 'antd';
import { MinusCircleOutlined, PlusOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { map, merge, isArray, concat, get } from 'lodash';
import classNames from 'classnames';

import YForm from '../index';
import { oneLineItemStyle } from '../utils';
import { YFormProps } from '../Form';
import { BaseComponentProps } from '../ItemsType';
import { YFormItemProps } from '../Items';

export type ShowIconsType = {
  showBottomAdd?: boolean | { text?: string };
  showAdd?: boolean;
  showRemove?: boolean;
};

export interface YFormListComponentProps extends BaseComponentProps {
  maxNum?: number;
  minNum?: number;
  showRightIcons?: boolean;
  showIcons?: ShowIconsType;
  onShowIcons?: (p: { index: number }) => Pick<ShowIconsType, 'showAdd' | 'showRemove'>;
  parentName?: YFormItemProps['name'];
}

export interface YFormListItems {
  index: number;
  field: { name: number; key: number; fieldKey: number; isListField?: boolean };
  add: () => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  icons: React.ReactNode;
}

export interface YFormListProps
  extends Pick<YFormItemProps, 'label' | 'name' | 'addonAfter' | 'scenes' | 'initialValue'>,
    Pick<YFormProps, 'form' | 'children' | 'disabled'> {
  items?: (p: YFormListItems) => YFormItemProps['children'];
  componentProps?: YFormListComponentProps;
  offset?: number;
}

export default (props: YFormListProps) => {
  const {
    form,
    initialValue,
    label,
    items,
    disabled,
    componentProps = {},
    name,
    offset,
    addonAfter,
    scenes,
  } = props;

  const {
    maxNum,
    minNum,
    showRightIcons = true,
    showIcons: { showBottomAdd = true, showAdd = true, showRemove = true } = {} as ShowIconsType,
    onShowIcons,
  } = componentProps;
  const context = React.useContext(YForm.ListContent);
  // 支持多级 List name 拼接
  const _name = context.prefixName ? concat(context.prefixName, name) : name;

  useEffect(() => {
    form.setFields([{ name: _name, value: initialValue }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="list">
      <Form.List name={name}>
        {(fields, { add, remove, move }) => {
          const isMax = maxNum ? fields.length < maxNum : true;
          const isMin = minNum ? fields.length > minNum : true;

          return (
            <>
              {fields.map((field, index) => {
                const _showIcons = onShowIcons ? onShowIcons({ index }) : {};
                const { showAdd: _showAdd, showRemove: _showRemove } = merge(
                  {},
                  { showAdd, showRemove },
                  _showIcons,
                );
                const icons: React.ReactNode[] = [];
                if (!disabled) {
                  if (isMax && _showAdd) {
                    icons.push(
                      <PlusCircleOutlined
                        key="plus"
                        onClick={() => {
                          // 先增加一位
                          add();
                          // 再把最后一位移动到当前
                          move(fields.length, index + 1);
                        }}
                      />,
                    );
                  }
                  if (isMin && _showRemove) {
                    icons.push(<MinusCircleOutlined key="minus" onClick={() => remove(index)} />);
                  }
                }

                const iconsWidth = icons.length * (8 + 14);
                const _oneLineStyle = oneLineItemStyle(['100%', iconsWidth]);
                // 第一行有 label（当然，外部需要传 label 参数）
                const _label = index === 0 && label;

                const _iconsDom = <div className={classNames('padding-icons')}>{icons}</div>;

                const dataSource =
                  items && items({ index, field, add, remove, move, icons: _iconsDom });
                let _children = dataSource;
                if (isArray(dataSource)) {
                  _children = map(dataSource, (item, index) => {
                    const _item = merge(
                      {},
                      {
                        scenes,
                        offset,
                        componentProps: !disabled &&
                          showRightIcons && { style: { ..._oneLineStyle[0] } },
                        label: index === 0 && _label,
                      },
                      item,
                      {
                        addonAfter: [
                          get(item, 'addonAfter'),
                          showRightIcons && !disabled && index === 0 && (
                            <div
                              key="icons"
                              className={classNames('padding-icons', 'inline-icons')}
                              style={_oneLineStyle[1]}
                            >
                              {icons}
                            </div>
                          ),
                        ].filter((x) => x),
                      },
                    );
                    return _item;
                  });
                }
                return (
                  <YForm.ListContent.Provider
                    key={field.key}
                    value={{ isList: true, field, prefixName: _name }}
                  >
                    <YForm.Items noStyle>{_children}</YForm.Items>
                  </YForm.ListContent.Provider>
                );
              })}
              {showBottomAdd && isMax && !disabled && (
                <YForm.Items>
                  {[
                    {
                      type: 'button',
                      offset,
                      componentProps: {
                        disabled,
                        type: 'dashed',
                        onClick: () => add(),
                        style: { width: '100%' },
                        children: (
                          <>
                            <PlusOutlined style={{ paddingRight: 5 }} />
                            {typeof showBottomAdd === 'object'
                              ? showBottomAdd.text
                              : `添加${label || ''}`}
                          </>
                        ),
                      },
                    },
                  ]}
                </YForm.Items>
              )}
            </>
          );
        }}
      </Form.List>
      {addonAfter}
    </div>
  );
};
