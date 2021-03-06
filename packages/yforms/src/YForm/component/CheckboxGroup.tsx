import React, { forwardRef } from 'react';
import { Checkbox } from 'antd';
import { map } from 'lodash';
import { CheckboxGroupProps } from 'antd/lib/checkbox';

import { getFieldKeyValue } from '../utils';
import { OptionsProps } from '../ItemsType';
import { useGetOptions } from '../hooks';

export interface YCheckGroupProps extends OptionsProps, Omit<CheckboxGroupProps, 'options'> {}

export default forwardRef<any, YCheckGroupProps>((props, ref) => {
  const {
    value,
    postField = 'id',
    showField = 'name',
    options,
    renderOption,
    onAddProps,
    getOptions,
    ...rest
  } = props;
  const list = useGetOptions();

  const children = map(list, (item, index: number) => {
    if (item) {
      const _postField = getFieldKeyValue(item, index, postField);
      const _showField = getFieldKeyValue(item, index, showField);
      return (
        <Checkbox
          key={_postField}
          value={_postField}
          disabled={item.disabled}
          {...(onAddProps && onAddProps(item, index))}
        >
          {/* 如果有 renderOption 就渲染 renderOption 如果没有默认用 showField 字段 */}
          {renderOption ? renderOption(item) : _showField}
        </Checkbox>
      );
    }
  });
  return (
    <Checkbox.Group value={value} {...rest} ref={ref}>
      {children}
    </Checkbox.Group>
  );
});
