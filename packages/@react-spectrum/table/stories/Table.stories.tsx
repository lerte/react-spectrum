/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {ActionButton, Button} from '@react-spectrum/button';
import Add from '@spectrum-icons/workflow/Add';
import {Breadcrumbs, Item} from '@react-spectrum/breadcrumbs';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Cell, Column, Row, TableBody, TableHeader} from './RACCollections';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {ControllingResize, PokemonColumn} from './ControllingResize';
import {CRUDExample} from './CRUDExample';
import Delete from '@spectrum-icons/workflow/Delete';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Divider} from '@react-spectrum/divider';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {HidingColumns} from './HidingColumns';
import {HidingColumnsAllowsResizing} from './HidingColumnsAllowsResizing';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Link} from '@react-spectrum/link';
import {LoadingState} from '@react-types/shared';
import NoSearchResults from '@spectrum-icons/illustrations/NoSearchResults';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React, {Key, useCallback, useState} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {SpectrumTableProps, TableView} from '../';
import {Switch} from '@react-spectrum/switch';
import {TextField} from '@react-spectrum/textfield';
import {useAsyncList, useListData} from '@react-stately/data';
import {useFilter} from '@react-aria/i18n';
import {View} from '@react-spectrum/view';

export default {
  title: 'TableView',
  component: TableView,
  args: {
    onAction: action('onAction'),
    onResizeStart: action('onResizeStart'),
    onResize: action('onResize'),
    onResizeEnd: action('onResizeEnd'),
    onSelectionChange: action('onSelectionChange'),
    onSortChange: action('onSortChange')
  },
  argTypes: {
    // intentionally added so that we can unset the default value
    // there is no argType for function
    // use the controls reset button to undo it
    // https://storybook.js.org/docs/react/essentials/controls#annotation
    onAction: {
      control: 'select',
      options: [undefined]
    },
    onResizeStart: {
      table: {
        disable: true
      }
    },
    onResize: {
      table: {
        disable: true
      }
    },
    onResizeEnd: {
      table: {
        disable: true
      }
    },
    onSelectionChange: {
      table: {
        disable: true
      }
    },
    onSortChange: {
      table: {
        disable: true
      }
    },
    disabledKeys: {
      table: {
        disable: true
      }
    },
    selectedKeys: {
      table: {
        disable: true
      }
    },
    density: {
      control: 'select',
      options: ['compact', 'regular', 'spacious']
    },
    overflowMode: {
      control: 'select',
      options: ['wrap', 'truncate']
    },
    isQuiet: {
      control: 'boolean'
    },
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple']
    },
    selectionStyle: {
      control: 'select',
      options: ['checkbox', 'highlight']
    },
    disallowEmptySelection: {
      control: 'boolean'
    }
  }
} as ComponentMeta<typeof TableView>;

export type TableStory = ComponentStoryObj<typeof TableView>;

export const Static: TableStory = {
  args: {
    'aria-label': 'TableView with static contents',
    width: 300,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column key="foo" isRowHeader>Foo</Column>
        <Column key="bar">Bar</Column>
        <Column key="baz">Baz</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>One</Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Row>
        <Row>
          <Cell>One</Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'static'
};

// TODO BREAKING: required isRowHeader
let columns = [
  {name: 'Foo', key: 'foo', isRowHeader: true},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

let items = [
  {id: 'Foo 1', test: 'Test 1', foo: 'Foo 1', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {id: 'Foo 2', test: 'Test 2', foo: 'Foo 2', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {id: 'Foo 3', test: 'Test 1', foo: 'Foo 3', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {id: 'Foo 4', test: 'Test 2', foo: 'Foo 4', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {id: 'Foo 5', test: 'Test 1', foo: 'Foo 5', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {id: 'Foo 6', test: 'Test 2', foo: 'Foo 6', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'},
  {id: 'Foo 7', test: 'Test 1', foo: 'Foo 7', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {id: 'Foo 8', test: 'Test 2', foo: 'Foo 8', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'}
];

export const Dynamic: TableStory = {
  args: {
    'aria-label': 'TableView with static contents',
    width: 300,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader columns={columns}>
        {column => <Column isRowHeader={column.isRowHeader}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={items}>
        {item =>
        (<Row columns={columns}>
          {column => <Cell>{item[column.key]}</Cell>}
        </Row>)
        }
      </TableBody>
    </TableView>
  ),
  name: 'dynamic'
};
// TODO BREAKING: had to provide columns to Row

let itemsWithFalsyId = [
  {key: '0', test: 'Test 1', foo: 'Foo 1', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1', id: 0},
  {key: 1, test: 'Test 1', foo: 'Foo 2', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1', id: 1}
];
// TODO BREAKING: no more falsy row keys?
// TODO ROB: going from selectionMode single to none causes a flash of the select all
// TODO ROB: animate in of table is slightly more obvious than before

export const DynamicFalsyRowKeys: TableStory = {
  args: {
    'aria-label': 'TableView with dynamic contents',
    width: 300,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader columns={columns}>
        {column => <Column isRowHeader={column.isRowHeader}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={itemsWithFalsyId}>
        {item =>
        (<Row columns={columns}>
          {column => <Cell>{item[column.key]}</Cell>}
        </Row>)
        }
      </TableBody>
    </TableView>
  ),
  name: 'dynamic, falsy row keys'
};

export const HorizontalScrollingOnly: TableStory = {
  args: {
    'aria-label': 'TableView with dynamic contents',
    width: 200,
    height: 220
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader columns={columns}>
        {column => <Column isRowHeader={column.isRowHeader}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={items.slice(0, 3)}>
        {item =>
        (<Row columns={columns}>
          {column => <Cell>{item[column.key]}</Cell>}
        </Row>)
        }
      </TableBody>
    </TableView>
  ),
  name: 'horizontal scrolling only'
};

export const HorizontalScrollingOnlyFlushBottom: TableStory = {
  args: {
    'aria-label': 'TableView with dynamic contents',
    width: 200,
    height: 174
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader columns={columns}>
        {column => <Column isRowHeader={column.isRowHeader}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={items.slice(0, 3)}>
        {item =>
        (<Row columns={columns}>
          {column => <Cell>{item[column.key]}</Cell>}
        </Row>)
        }
      </TableBody>
    </TableView>
  ),
  name: 'horizontal scrolling only flush bottom'
};

export const DynamicWithDisabledKeys: TableStory = {
  ...Dynamic,
  args: {
    ...Dynamic.args,
    disabledKeys: new Set(['Foo 1', 'Foo 3'])
  },
  name: 'dynamic with disabled keys'
};

export const DynamicShowDividers: TableStory = {
  args: {
    'aria-label': 'TableView with static contents',
    width: 300,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader columns={columns}>
        {column => <Column showDivider isRowHeader={column.isRowHeader}>{column.name}</Column>}
      </TableHeader>
      <TableBody items={items}>
        {item =>
        (<Row columns={columns}>
          {column => <Cell>{item[column.key]}</Cell>}
        </Row>)
        }
      </TableBody>
    </TableView>
  ),
  name: 'dynamic showDividers'
};

export const DynamicSelectedKeys: TableStory = {
  ...Dynamic,
  args: {
    ...Dynamic.args,
    selectedKeys: new Set(['Foo 1', 'Foo 3']),
    selectionMode: 'multiple'
  },
  name: 'selectedKeys',
  parameters: {
    controls: {
      exclude: /selectionMode/
    }
  }
};

export const StaticNestedColumns: TableStory = {
  args: {
    'aria-label': 'TableView with nested columns',
    width: 500,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column key="test">Test</Column>
        <Column title="Group 1" colspan={2}>
          <Column key="foo" isRowHeader>Foo</Column>
          <Column key="bar">Bar</Column>
        </Column>
        <Column title="Group 2" colspan={1}>
          <Column key="baz">Baz</Column>
        </Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>Test1</Cell>
          <Cell>One</Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Row>
        <Row>
          <Cell>Test2</Cell>
          <Cell>One</Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'static with nested columns'
};

let nestedColumns = [
  {name: 'Test', key: 'test', isRowHeader: true},
  {
    name: 'Tiered One Header', key: 'tier1', children: [
      {
        name: 'Tier Two Header A', key: 'tier2a', children: [
          {name: 'Foo', key: 'foo'},
          {name: 'Bar', key: 'bar'}
        ]
      },
      {name: 'Yay', key: 'yay'},
      {
        name: 'Tier Two Header B', key: 'tier2b', children: [
          {name: 'Baz', key: 'baz'}
        ]
      }
    ]
  }
];

export const DynamicNestedColumns: TableStory = {
  args: {
    'aria-label': 'TableView with nested columns',
    width: 700,
    height: 300
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader columns={nestedColumns}>
        {column =>
          <Column childColumns={column.children} isRowHeader={column.isRowHeader}>{column.name}</Column>
        }
      </TableHeader>
      <TableBody items={items}>
        {item =>
        (<Row columns={columns}>
          {column => <Cell>{item[column.key]}</Cell>}
        </Row>)
        }
      </TableBody>
    </TableView>
  ),
  name: 'dynamic with nested columns'
};

export const DynamicNestedColumnsWithResizing: TableStory = {
  args: {
    'aria-label': 'TableView with nested columns',
    width: 700,
    height: 300
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader columns={nestedColumns}>
        {column =>
          <Column allowsResizing childColumns={column.children} isRowHeader={column.isRowHeader}>{column.name}</Column>
        }
      </TableHeader>
      <TableBody items={items}>
        {item =>
        (<Row columns={columns}>
          {column => <Cell>{item[column.key]}</Cell>}
        </Row>)
        }
      </TableBody>
    </TableView>
  ),
  name: 'dynamic with nested columns with resizing'
};

export const FocusableCells: TableStory = {
  args: {
    'aria-label': 'TableView with focusable cells',
    width: 450,
    height: 200
  },
  render: (args) => (
    <Flex direction="column">
      <label htmlFor="focus-before">Focus before</label>
      <input id="focus-before" />
      <TableView {...args}>
        <TableHeader>
          <Column key="foo" isRowHeader>Foo</Column>
          <Column key="bar">Bar</Column>
          <Column key="baz">baz</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell><Switch aria-label="Foo" /></Cell>
            <Cell><Link><a href="https://yahoo.com" target="_blank">Yahoo</a></Link></Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell><Switch aria-label="Foo" /><Switch aria-label="Bar" /></Cell>
            <Cell><Link><a href="https://google.com" target="_blank">Google</a></Link></Cell>
            <Cell>Three</Cell>
          </Row>
          <Row>
            <Cell><Switch aria-label="Foo" /></Cell>
            <Cell><Link><a href="https://yahoo.com" target="_blank">Yahoo</a></Link></Cell>
            <Cell>Three</Cell>
          </Row>
        </TableBody>
      </TableView>
      <label htmlFor="focus-after">Focus after</label>
      <input id="focus-after" />
    </Flex>
  ),
  name: 'focusable cells'
};

let manyColumns = [];
for (let i = 0; i < 100; i++) {
  manyColumns.push({name: 'Column ' + i, key: 'C' + i});
}
manyColumns[0].isRowHeader = true;

let manyRows = [];
for (let i = 0; i < 1000; i++) {
  let row = {id: 'R' + i};
  for (let j = 0; j < 100; j++) {
    row['C' + j] = `${i}, ${j}`;
  }

  manyRows.push(row);
}

export const ManyColumnsAndRows: TableStory = {
  args: {
    'aria-label': 'TableView with many columns and rows',
    width: 700,
    height: 500
  },
  render: (args) => (
    <>
      <label htmlFor="focus-before">Focus before</label>
      <input id="focus-before" />
      <TableView {...args}>
        <TableHeader columns={manyColumns}>
          {column =>
            <Column minWidth={100} isRowHeader={column.isRowHeader}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={manyRows}>
          {item =>
          (<Row columns={manyColumns}>
            {column => <Cell>{item[column.key]}</Cell>}
          </Row>)
          }
        </TableBody>
      </TableView>
      <label htmlFor="focus-after">Focus after</label>
      <input id="focus-after" />
    </>
  ),
  name: 'many columns and rows'
};

const TableViewFilledCellWidths = (props: SpectrumTableProps<unknown> & { allowsResizing: boolean }) => {
  let {allowsResizing, ...otherProps} = props;
  return (
    <TableView {...otherProps}>
      <TableHeader>
        <Column allowsResizing={allowsResizing} isRowHeader>File Name</Column>
        <Column allowsResizing={allowsResizing} align="center">Type</Column>
        <Column allowsResizing={allowsResizing} align="end">Size</Column>
        <Column allowsResizing={allowsResizing}>Description</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>2018 Proposal</Cell>
          <Cell>PDF</Cell>
          <Cell>214 KB</Cell>
          <Cell>very very very very very very long long long long long description</Cell>
        </Row>
        <Row>
          <Cell>
            <View
              width="100%"
              backgroundColor="gray-200">
              100%
            </View>
          </Cell>
          <Cell>
            <View
              UNSAFE_style={{margin: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
              width="100%"
              backgroundColor="gray-200">
              100%
            </View>
          </Cell>
          <Cell>
            <View
              UNSAFE_style={{marginInlineStart: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
              width="100%"
              backgroundColor="gray-200">
              100%
            </View>
          </Cell>
          <Cell>
            <View
              UNSAFE_style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
              width="100%"
              backgroundColor="gray-200">
              very very very very very very long long long long long description
            </View>
          </Cell>
        </Row>
        <Row>
          <Cell>
            <View
              UNSAFE_style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
              width="50%"
              backgroundColor="gray-200">
              50% div
            </View>
          </Cell>
          <Cell>
            <View
              UNSAFE_style={{margin: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
              width="70%"
              backgroundColor="gray-200">
              70% div
            </View>
          </Cell>
          <Cell>
            <View
              UNSAFE_style={{float: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
              width="70%"
              backgroundColor="gray-200">
              70% div
            </View>
          </Cell>
          <Cell>
            <View
              UNSAFE_style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}
              width="70%"
              backgroundColor="gray-200">
              very very very very very very long long long long long description
            </View>
          </Cell>
        </Row>
        <Row>
          <Cell>
            <span style={{backgroundColor: 'var(--spectrum-global-color-gray-200'}}>
              span child
            </span>
          </Cell>
          <Cell>
            <span style={{backgroundColor: 'var(--spectrum-global-color-gray-200'}}>
              span child
            </span>
          </Cell>
          <Cell>
            <span style={{backgroundColor: 'var(--spectrum-global-color-gray-200'}}>
              span child
            </span>
          </Cell>
          <Cell>
            <span style={{backgroundColor: 'var(--spectrum-global-color-gray-200'}}>
              very very very very very very long long long long long description
            </span>
          </Cell>
        </Row>
      </TableBody>
    </TableView>
  );
};

export const ShouldFillCellWidth: ComponentStoryObj<typeof TableViewFilledCellWidths> = {
  args: {
    'aria-label': 'TableView with filled cells',
    width: 500,
    height: 200
  },
  render: (args) => <TableViewFilledCellWidths {...args} />,
  name: 'should fill cell width',
  argTypes: {
    allowsResizing: {type: 'boolean'}
  }
};

export const ColumnWidthsAndDividers: TableStory = {
  args: {
    'aria-label': 'TableView with column widths and dividers',
    width: 500,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column width={250} showDivider isRowHeader>File Name</Column>
        <Column>Type</Column>
        <Column align="end">Size</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>2018 Proposal</Cell>
          <Cell>PDF</Cell>
          <Cell>214 KB</Cell>
        </Row>
        <Row>
          <Cell>Budget</Cell>
          <Cell>XLS</Cell>
          <Cell>120 KB</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'column widths and dividers'
};


export const CellWithLongContent: TableStory = {
  args: {
    'aria-label': 'TableView with column widths and dividers',
    width: 500,
    height: 300
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column width={250} showDivider isRowHeader>File Name</Column>
        <Column>Type</Column>
        <Column align="end">Size</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>2018 Proposal with very very very very very very long long long long long filename</Cell>
          <Cell>PDF</Cell>
          <Cell>214 KB</Cell>
        </Row>
        <Row>
          <Cell>Budget</Cell>
          <Cell>XLS</Cell>
          <Cell>120 KB</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'cell with long content',
  parameters: {
    description: {
      data: 'After changing overflowMode, refresh page to see the change.'
    }
  }
};

export const CustomRowHeaderLabeling: TableStory = {
  args: {
    'aria-label': 'TableView with custom row header labeling',
    width: 500,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column isRowHeader>First Name</Column>
        <Column isRowHeader>Last Name</Column>
        <Column>Birthday</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>Sam</Cell>
          <Cell>Smith</Cell>
          <Cell>May 3</Cell>
        </Row>
        <Row>
          <Cell>Julia</Cell>
          <Cell>Jones</Cell>
          <Cell>February 10</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'custom isRowHeader labeling',
  parameters: {
    description: {
      content: 'Changes how the screen reader labels rows.'
    }
  }
};

export const CRUD: TableStory = {
  render: (args) => <CRUDExample {...args} />,
  name: 'CRUD'
};

let deletableRowsTableProps = [
  {key: 'firstName', name: 'First Name', isRowHeader: true},
  {key: 'lastName', name: 'Last Name', isRowHeader: true},
  {key: 'birthday', name: 'Birthday'},
  {key: 'actions', name: 'Actions', align: 'end'}
];

function DeletableRowsTable(props: SpectrumTableProps<unknown>) {
  let list = useListData({
    initialItems: [
      {id: 1, firstName: 'Sam', lastName: 'Smith', birthday: 'May 3'},
      {id: 2, firstName: 'Julia', lastName: 'Jones', birthday: 'February 10'}
    ]
  });
  let onSelectionChange = useCallback((keys) => {
    props.onSelectionChange(keys);
    list.setSelectedKeys(keys);
  }, [props, list]);

  return (
    <TableView
      {...props}
      selectedKeys={list.selectedKeys}
      onSelectionChange={onSelectionChange}
      renderEmptyState={list.items.length === 0 ? () => <EmptyState /> : undefined}>
      <TableHeader columns={deletableRowsTableProps}>
        {column =>
          <Column isRowHeader={column.isRowHeader} align={column.align}>{column.name}</Column>
        }
      </TableHeader>
      <TableBody items={list.items}>
        {item =>
        (<Row columns={deletableRowsTableProps}>
          {column =>
          (<Cell>
            {column.key === 'actions'
              ? <ActionButton onPress={() => list.remove(item.id)}>Delete</ActionButton>
              : item[column.key]
            }
          </Cell>)
          }
        </Row>)
        }
      </TableBody>
    </TableView>
  );
}

export const InlineDeleteButtons: TableStory = {
  args: {
    'aria-label': 'People',
    width: 500,
    height: 300
  },
  render: (args) => <DeletableRowsTable {...args} />,
  name: 'Inline delete buttons'
};

export const HidingColumnsExample: TableStory = {
  render: (args) => <HidingColumns {...args} />,
  name: 'hiding columns'
};
// TODO ROB: Hiding columns is broken

export const IsLoading: TableStory = {
  args: {
    'aria-label': 'TableView loading',
    width: 700,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader columns={manyColumns}>
        {column =>
          <Column minWidth={100} isRowHeader={column.isRowHeader}>{column.name}</Column>
        }
      </TableHeader>
      <TableBody items={[]} loadingState="loading">
        {item =>
        (<Row columns={manyColumns}>
          {column => <Cell>{item[column.key]}</Cell>}
        </Row>)
        }
      </TableBody>
    </TableView>
  ),
  name: 'isLoading'
};

export const IsLoadingMore: TableStory = {
  args: {
    'aria-label': 'TableView loading more',
    width: 700,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader columns={manyColumns}>
        {column =>
          <Column minWidth={100} isRowHeader={column.isRowHeader}>{column.name}</Column>
        }
      </TableHeader>
      <TableBody items={[]} loadingState="loadingMore">
        {item =>
        (<Row columns={manyColumns}>
          {column => <Cell>{item[column.key]}</Cell>}
        </Row>)
        }
      </TableBody>
    </TableView>
  ),
  name: 'isLoading more'
};

export const Filtering: TableStory = {
  args: {
    'aria-label': 'TableView filtering',
    width: 700,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader columns={columns}>
        {column =>
          <Column minWidth={100} isRowHeader={column.isRowHeader}>{column.name}</Column>
        }
      </TableHeader>
      <TableBody items={items} loadingState="filtering">
        {item =>
        (<Row columns={columns}>
          {column => <Cell>{item[column.key]}</Cell>}
        </Row>)
        }
      </TableBody>
    </TableView>
  ),
  name: 'filtering'
};

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <svg width="150" height="103" viewBox="0 0 150 103">
        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
      </svg>
      <Heading>No results</Heading>
      <Content>No results found, press <Link onPress={action('linkPress')}>here</Link> for more info.</Content>
    </IllustratedMessage>
  );
}

function EmptyStateTable(props) {
  let [show, setShow] = useState(false);
  let [sortDescriptor, setSortDescriptor] = useState({});
  return (
    <Flex direction="column">
      <ActionButton width="100px" onPress={() => setShow(show => !show)}>Toggle items</ActionButton>
      <TableView aria-label="TableView with empty state" width={700} height={400} {...props} renderEmptyState={renderEmptyState} selectionMode="multiple" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
        <TableHeader columns={manyColumns}>
          {column =>
            <Column allowsResizing allowsSorting minWidth={100} isRowHeader={column.isRowHeader}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={show ? manyRows : []}>
          {item =>
          (<Row key={item.foo} columns={manyColumns}>
            {column => <Cell>{item[column.key]}</Cell>}
          </Row>)
          }
        </TableBody>
      </TableView>
    </Flex>
  );
}

export const EmptyStateStory: TableStory = {
  render: (args) => <EmptyStateTable {...args} />,
  name: 'renderEmptyState'
};
// TODO ROB: performance is terrible with resizing when items are loaded, seem to get 2-3 x more onResize?

let asyncCols = [
  {id: 'score', defaultWidth: 100, name: 'Score'},
  {id: 'title', isRowHeader: true, name: 'Title'},
  {id: 'author', defaultWidth: 200, name: 'Author'},
  {id: 'num_comments', defaultWidth: 100, name: 'Comments'}
];

function AsyncLoadingExample(props) {
  const {isResizable} = props;
  interface Item {
    data: {
      id: string,
      url: string,
      title: string
    }
  }

  let list = useAsyncList<Item>({
    getKey: (item) => item.data.id,
    async load({signal, cursor}) {
      let url = new URL('https://www.reddit.com/r/upliftingnews.json');
      if (cursor) {
        url.searchParams.append('after', cursor);
      }

      let res = await fetch(url.toString(), {signal});
      let json = await res.json();
      return {items: json.data.children.map(item => ({...item, id: item.data.id})), cursor: json.data.after};
    },
    sort({items, sortDescriptor}) {
      return {
        items: items.slice().sort((a, b) => {
          let cmp = a.data[sortDescriptor.column] < b.data[sortDescriptor.column] ? -1 : 1;
          if (sortDescriptor.direction === 'descending') {
            cmp *= -1;
          }
          return cmp;
        })
      };
    }
  });

  return (
    <div>
      <ActionButton marginBottom={10} onPress={() => list.remove(list.items[0].data.id)}>Remove first item</ActionButton>
      <TableView {...props} sortDescriptor={list.sortDescriptor} onSortChange={list.sort} selectedKeys={list.selectedKeys} onSelectionChange={list.setSelectedKeys}>
        <TableHeader columns={asyncCols}>
          {column =>
            <Column {...column} allowsResizing={isResizable} allowsSorting>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={list.items} loadingState={list.loadingState} onLoadMore={list.loadMore}>
          {item =>
          (<Row columns={asyncCols}>
            {column =>
              column.id === 'title'
                ? <Cell textValue={item.data.title}><Link isQuiet><a href={item.data.url} target="_blank">{item.data.title}</a></Link></Cell>
                : <Cell>{item.data[column.id]}</Cell>
            }
          </Row>)
          }
        </TableBody>
      </TableView>
    </div>
  );
}
// TODO ROB: sorting not working with async loading // FIXED

export const AsyncLoading: TableStory = {
  args: {
    'aria-label': 'Top news from Reddit',
    selectionMode: 'multiple',
    width: 1000,
    height: 400
  },
  render: (args) => <AsyncLoadingExample {...args} />,
  name: 'async loading'
};

export const HideHeader: TableStory = {
  args: {
    'aria-label': 'TableView with static contents',
    width: 350,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column key="foo" isRowHeader>
          Foo
        </Column>
        <Column key="addAction" hideHeader>
          Add Info
        </Column>
        <Column key="deleteAction" hideHeader showDivider>
          Delete Item
        </Column>
        <Column key="bar">Bar</Column>
        <Column key="baz">Baz</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>One</Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Add Info">
              <Add />
            </ActionButton>
          </Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Delete">
              <Delete />
            </ActionButton>
          </Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Row>
        <Row>
          <Cell>One</Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Add Info">
              <Add />
            </ActionButton>
          </Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Delete">
              <Delete />
            </ActionButton>
          </Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Row>
        <Row>
          <Cell>One</Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Add Info">
              <Add />
            </ActionButton>
          </Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Delete">
              <Delete />
            </ActionButton>
          </Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Row>
        <Row>
          <Cell>One</Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Add Info">
              <Add />
            </ActionButton>
          </Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Delete">
              <Delete />
            </ActionButton>
          </Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Row>
        <Row>
          <Cell>One</Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Add Info">
              <Add />
            </ActionButton>
          </Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Delete">
              <Delete />
            </ActionButton>
          </Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Row>
        <Row>
          <Cell>One</Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Add Info">
              <Add />
            </ActionButton>
          </Cell>
          <Cell>
            <ActionButton isQuiet aria-label="Delete">
              <Delete />
            </ActionButton>
          </Cell>
          <Cell>Two</Cell>
          <Cell>Three</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'hideHeader'
};

let COLUMNS = [
  {
    name: 'Name',
    key: 'name',
    minWidth: 200,
    isRowHeader: true
  },
  {
    name: 'Owner',
    key: 'ownerName'
  }
];

async function getCollectionItems(): Promise<any> {
  const result = [
    {
      id: 'xx',
      name: 'abc',
      ownerName: 'xx'
    },
    {
      id: 'aa',
      name: 'efg',
      ownerName: 'aa'
    },
    {
      id: 'yy',
      name: 'abcd',
      ownerName: 'yy'
    },
    {
      id: 'bb',
      name: 'efgh',
      ownerName: 'bb'
    },
    {
      id: 'zz',
      name: 'abce',
      ownerName: 'zz'
    },
    {
      id: 'cc',
      name: 'efgi',
      ownerName: 'cc'
    }
  ];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, 5);
  });
}

function ProjectListTable(props) {
  interface Item {
    id: string,
    name: string,
    ownerName: string
  }

  let {contains} = useFilter({sensitivity: 'base'});
  let [filterText, setFilterText] = React.useState('');
  let list = useAsyncList<Item>({
    async load() {
      let projects = await getCollectionItems();
      return {items: projects};
    }
  });
  let filteredItems = React.useMemo(() => list.items.filter(item => contains(item.name, filterText)), [list.items, filterText, contains]);
  const onChange = (value) => {
    setFilterText(value);
  };

  return (
    <div>
      <SearchField
        marginStart={'size-200'}
        marginBottom={'size-200'}
        marginTop={'size-200'}
        width={'size-3600'}
        aria-label={'Search by name'}
        value={filterText}
        onChange={(onChange)} />
      <View flexGrow={1} height={700} overflow="hidden">
        <TableView
          aria-label={'Project list'}
          {...props}
          height={'100%'}
          sortDescriptor={list.sortDescriptor}
          onSortChange={list.sort}>
          <TableHeader columns={COLUMNS}>
            {(column) => {
              const {name, ...columnProps} = column;
              return <Column {...columnProps}>{name}</Column>;
            }}
          </TableHeader>
          <TableBody
            items={filteredItems}
            loadingState={list.loadingState}>
            {(item) => (
              <Row columns={COLUMNS}>{column => <Cell>{item[column.key]}</Cell>}</Row>
            )}
          </TableBody>
        </TableView>
      </View>
    </div>
  );
}

export const AsyncLoadingClientFiltering: TableStory = {
  render: (args) => <ProjectListTable {...args} />,
  name: 'async client side filter loading'
};

function AsyncServerFilterTable(props) {
  interface Item {
    name: string,
    height: string,
    mass: string
  }

  let columns = [
    {
      name: 'Name',
      key: 'name',
      minWidth: 200,
      isRowHeader: true
    },
    {
      name: 'Height',
      key: 'height'
    },
    {
      name: 'Mass',
      key: 'mass'
    }
  ];

  let list = useAsyncList<Item>({
    getKey: (item) => item.name,
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results.map(item => ({...item, id: item.name})),
        cursor: json.next
      };
    }
  });

  const onChange = (value) => {
    list.setFilterText(value);
  };

  return (
    <div>
      <SearchField
        marginStart={'size-200'}
        marginBottom={'size-200'}
        marginTop={'size-200'}
        width={'size-3600'}
        aria-label={'Search by name'}
        defaultValue={list.filterText}
        onChange={(onChange)} />
      <TableView
        aria-label={'Star Wars Characters'}
        height={200}
        width={600}
        {...props}
        sortDescriptor={list.sortDescriptor}
        onSortChange={list.sort}>
        <TableHeader columns={columns}>
          {(column) => {
            const {name, ...columnProps} = column;
            return <Column {...columnProps}>{name}</Column>;
          }}
        </TableHeader>
        <TableBody
          items={list.items}
          loadingState={list.loadingState}
          onLoadMore={list.loadMore}>
          {(item) => (
            <Row columns={columns}>{column => <Cell>{item[column.key]}</Cell>}</Row>
          )}
        </TableBody>
      </TableView>
    </div>
  );
}

export const AsyncLoadingServerFiltering: TableStory = {
  render: (args) => <AsyncServerFilterTable {...args} />,
  name: 'async server side filter loading'
};

export const AsyncLoadingServerFilteringLoadMore: TableStory = {
  args: {
    height: 500
  },
  render: (args) => <AsyncServerFilterTable {...args} />,
  name: 'loads more on scroll when contentSize.height < rect.height * 2'
};

export const WithDialogTrigger: TableStory = {
  args: {
    'aria-label': 'TableView with static contents',
    width: 300,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column key="foo" isRowHeader>Foo</Column>
        <Column key="bar">Bar</Column>
        <Column key="baz">Baz</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>One</Cell>
          <Cell>Two</Cell>
          <Cell>
            <DialogTrigger>
              <ActionButton aria-label="Add"><Add /></ActionButton>
              {close => (
                <Dialog>
                  <Heading>The Heading</Heading>
                  <Divider />
                  <Content>
                    <TextField label="Last Words" />
                  </Content>
                  <ButtonGroup>
                    <Button variant="secondary" onPress={close}>Cancel</Button>
                    <Button variant="cta" onPress={close}>Confirm</Button>
                  </ButtonGroup>
                </Dialog>
              )}
            </DialogTrigger>
          </Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'with dialog trigger'
};

function TableWithBreadcrumbs(props) {
  const fs = [
    {key: 'a', name: 'Folder A', type: 'folder'},
    {key: 'b', name: 'File B', value: '10 MB'},
    {key: 'c', name: 'File C', value: '10 MB', parent: 'a'},
    {key: 'd', name: 'File D', value: '10 MB', parent: 'a'}
  ];

  let columns = [
    {key: 'name', name: 'Name', isRowHeader: true},
    {key: 'value', name: 'Value'}
  ];

  const [loadingState, setLoadingState] = useState<LoadingState>('idle' as 'idle');
  const [selection, setSelection] = useState<'all' | Iterable<Key>>(new Set([]));
  const [items, setItems] = useState(() => fs.filter(item => !item.parent));
  const changeFolder = (folder) => {
    setItems([]);
    setLoadingState('loading' as 'loading');

    // mimic loading behavior
    setTimeout(() => {
      setLoadingState('idle');
      setItems(fs.filter(item => folder ? item.parent === folder : !item.parent));
    }, 700);
    setSelection(new Set([]));
  };

  return (
    <Flex direction="column" width="400px">
      <div>The TableView should not error if row selection changes due to items changes from external navigation (breadcrumbs).</div>
      <Breadcrumbs
        onAction={item => {
          if (item === 'root') {
            changeFolder('');
          }
        }}>
        <Item key="root">root</Item>
        <Item>a</Item>
      </Breadcrumbs>
      <TableView
        width="400px"
        aria-label="table"
        {...props}
        selectedKeys={selection}
        onSelectionChange={(sel) => setSelection(sel)}>
        <TableHeader columns={columns}>
          {(column) => <Column {...column}>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items} loadingState={loadingState}>
          {(item) => (
            <Row columns={columns}>
              {(column) => {
                if (item.type === 'folder' && column.key === 'name') {
                  return (
                    <Cell textValue={item[column.key]}>
                      <Link onPress={() => changeFolder(item.key)}>
                        {item[column.key]}
                      </Link>
                    </Cell>
                  );
                }
                return <Cell>{item[column.key]}</Cell>;
              }}
            </Row>
          )}
        </TableBody>
      </TableView>
      <ActionButton onPress={() => setSelection(items.some(item => item.key === 'd') ? new Set(['d']) : new Set([]))}>Select D</ActionButton>
    </Flex>
  );
}

export const WithBreadcrumbNavigation: TableStory = {
  args: {
    // onAction is attached to everything by default now, but that changes the behavior of TableView
    // our tests using this component expect the non-onAction behavior
    onAction: undefined
  },
  render: (args) => <TableWithBreadcrumbs {...args} />,
  name: 'table with breadcrumb navigation'
};

export const ResizingUncontrolledDynamicWidths: TableStory = {
  args: {
    'aria-label': 'TableView with resizable columns',
    width: 800,
    height: 200
  },
  render: (args) => (
    <>
      <label htmlFor="focusable-before">Focusable before</label>
      <input id="focusable-before" />
      <TableView {...args}>
        <TableHeader>
          <Column allowsResizing defaultWidth="1fr" isRowHeader>File Name</Column>
          <Column allowsResizing defaultWidth="2fr">Type</Column>
          <Column allowsResizing defaultWidth="2fr">Size</Column>
          <Column allowsResizing defaultWidth="1fr">Weight</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>2018 Proposal</Cell>
            <Cell>PDF</Cell>
            <Cell>214 KB</Cell>
            <Cell>1 LB</Cell>
          </Row>
          <Row>
            <Cell>Budget</Cell>
            <Cell>XLS</Cell>
            <Cell>120 KB</Cell>
            <Cell>20 LB</Cell>
          </Row>
        </TableBody>
      </TableView>
      <label htmlFor="focusable-after">Focusable after</label>
      <input id="focusable-after" />
    </>
  ),
  name: 'allowsResizing, uncontrolled, dynamic widths'
};

export const ResizingUncontrolledStaticWidths: TableStory = {
  args: {
    'aria-label': 'TableView with resizable columns',
    width: 800,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column allowsResizing defaultWidth="50%" isRowHeader>File Name</Column>
        <Column allowsResizing defaultWidth="20%">Type</Column>
        <Column allowsResizing defaultWidth={239}>Size</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>2018 Proposal</Cell>
          <Cell>PDF</Cell>
          <Cell>214 KB</Cell>
        </Row>
        <Row>
          <Cell>Budget</Cell>
          <Cell>XLS</Cell>
          <Cell>120 KB</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'allowsResizing, uncontrolled, static widths'
};

export const ResizingUncontrolledColumnDivider: TableStory = {
  args: {
    'aria-label': 'TableView with resizable columns and divider',
    width: 800,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column allowsResizing showDivider isRowHeader>File Name</Column>
        <Column allowsResizing defaultWidth="3fr">Type</Column>
        <Column allowsResizing>Size</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>2018 Proposal</Cell>
          <Cell>PDF</Cell>
          <Cell>214 KB</Cell>
        </Row>
        <Row>
          <Cell>Budget</Cell>
          <Cell>XLS</Cell>
          <Cell>120 KB</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'allowsResizing, uncontrolled, column divider'
};

export const ResizingUncontrolledMinMax: TableStory = {
  args: {
    'aria-label': 'TableView with resizable columns',
    width: 800,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column allowsResizing defaultWidth={200} minWidth={175} maxWidth={300} isRowHeader>File Name</Column>
        <Column allowsResizing defaultWidth="1fr" minWidth={175} maxWidth={500}>Size</Column>
        <Column allowsResizing defaultWidth={200} minWidth={175} maxWidth={300}>Type</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>2018 Proposal</Cell>
          <Cell>PDF</Cell>
          <Cell>214 KB</Cell>
        </Row>
        <Row>
          <Cell>Budget</Cell>
          <Cell>XLS</Cell>
          <Cell>120 KB</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'allowsResizing, uncontrolled, min/max widths'
};

export const ResizingUncontrolledSomeNotAllowed: TableStory = {
  args: {
    'aria-label': 'TableView with resizable columns',
    width: 800,
    height: 200
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column allowsResizing isRowHeader>File Name</Column>
        <Column defaultWidth="1fr">Type</Column>
        <Column defaultWidth="2fr">Size</Column>
        <Column allowsResizing defaultWidth="2fr">Weight</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>2018 Proposal</Cell>
          <Cell>PDF</Cell>
          <Cell>214 KB</Cell>
          <Cell>1 LB</Cell>
        </Row>
        <Row>
          <Cell>Budget</Cell>
          <Cell>XLS</Cell>
          <Cell>120 KB</Cell>
          <Cell>20 LB</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'allowsResizing, uncontrolled, some columns not allowed resizing'
};

export const ResizingUncontrolledNoHeightWidth: TableStory = {
  args: {
    'aria-label': 'TableView with resizable columns and no width or height set'
  },
  render: (args) => (
    <TableView {...args}>
      <TableHeader>
        <Column allowsResizing defaultWidth={150} isRowHeader>File Name</Column>
        <Column allowsResizing defaultWidth={100}>Type</Column>
        <Column allowsResizing defaultWidth={100}>Size</Column>
        <Column allowsResizing defaultWidth={100}>Weight</Column>
      </TableHeader>
      <TableBody>
        <Row>
          <Cell>2018 Proposal</Cell>
          <Cell>PDF</Cell>
          <Cell>214 KB</Cell>
          <Cell>1 LB</Cell>
        </Row>
        <Row>
          <Cell>Budget</Cell>
          <Cell>XLS</Cell>
          <Cell>120 KB</Cell>
          <Cell>20 LB</Cell>
        </Row>
      </TableBody>
    </TableView>
  ),
  name: 'allowsResizing, uncontrolled, undefined table width and height'
};

export const ResizingUncontrolledSortableColumns: TableStory = {
  args: {
    width: 1000,
    height: 400
  },
  render: (args) => <AsyncLoadingExample isResizable {...args} />,
  name: 'allowsResizing, uncontrolled, sortable columns'
};

export const ResizingManyColumnsRows: TableStory = {
  args: {
    'aria-label': 'TableView with many columns and rows',
    width: 700,
    height: 500
  },
  render: (args) => (
    <>
      <label htmlFor="focusable-before">Focusable before</label>
      <input id="focusable-before" />
      <TableView {...args}>
        <TableHeader columns={manyColumns}>
          {column =>
            <Column allowsResizing minWidth={100} {...column}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={manyRows}>
          {item =>
          (<Row columns={manyColumns}>
            {column => <Cell>{item[column.key]}</Cell>}
          </Row>)
          }
        </TableBody>
      </TableView>
      <label htmlFor="focusable-after">Focusable after</label>
      <input id="focusable-after" />
    </>
  ),
  name: 'allowsResizing, many columns and rows'
};

export const ResizingHidingColumns: TableStory = {
  render: (args) => <HidingColumnsAllowsResizing {...args} />,
  name: 'allowsResizing, hiding columns'
};
// TODO ROB: fix weird error in console about valid react component

function EmptyState() {
  return (
    <IllustratedMessage>
      <NoSearchResults />
      <Heading>No results</Heading>
    </IllustratedMessage>
  );
}

function ZoomResizing(props) {
  const [child, setChild] = useState('loader');

  let columns = [{id: '0', name: 'column', isRowHeader: true}];
  return (
    <div className="App" style={{height: '100vh'}}>
      <RadioGroup
        label="Child type"
        orientation="horizontal"
        value={child}
        onChange={setChild}>
        <Radio value="loader">Loading state</Radio>
        <Radio value="empty">Empty state</Radio>
      </RadioGroup>
      <Flex height="100%">
        <TableView
          height="100%"
          width="100%"
          {...props}
          renderEmptyState={child === 'empty' ? () => <EmptyState /> : undefined}>
          <TableHeader columns={columns}>
            {column => <Column {...column}>{column.name}</Column>}
          </TableHeader>
          <TableBody
            items={[]}
            loadingState={child === 'loader' ? 'loading' : undefined}>
            {(item) => (
              <Row columns={columns}>
                {(column) => (
                  <Cell>{item[column.name]}</Cell>
                )}
              </Row>
            )}
          </TableBody>
        </TableView>
      </Flex>
    </div>
  );
}

export const ResizingZoom: TableStory = {
  render: (args) => (
    <div style={{position: 'absolute', height: 'calc(100vh-32px)', width: 'calc(100vw - 32px)'}}>
      <ZoomResizing {...args} />
    </div>
  ),
  name: 'zoom resizing table',
  parameters: {description: {data: 'Using browser zoom should not trigger an infinite resizing loop. CMD+"+" to zoom in and CMD+"-" to zoom out.'}}
};

let uncontrolledColumns: PokemonColumn[] = [
  {name: 'Name', id: 'name', isRowHeader: true},
  {name: 'Type', id: 'type'},
  {name: 'Height', id: 'height'},
  {name: 'Weight', id: 'weight'},
  {name: 'Level', id: 'level'}
];

export const ResizingControlledNoInitialWidths: TableStory = {
  render: (args) =>
    <ControllingResize {...args} width={900} columns={uncontrolledColumns} />,
  name: 'allowsResizing, controlled, no widths',
  parameters: {
    description: {
      data: `
    You can use the buttons to save and restore the column widths. When restoring,
    you will notice that the entire table reverts, this is because no columns are controlled.
  `}
  }
};

let columnsSomeFR: PokemonColumn[] = [
  {name: 'Name', id: 'name', width: '1fr', isRowHeader: true},
  {name: 'Type', id: 'type', width: '1fr'},
  {name: 'Height', id: 'height'},
  {name: 'Weight', id: 'weight'},
  {name: 'Level', id: 'level', width: '4fr'}
];

export const ResizingControlledSomeInitialWidths: TableStory = {
  render: (args) => (
    <ControllingResize {...args} width={900} columns={columnsSomeFR} />
  ),
  name: 'allowsResizing, controlled, some widths',
  parameters: {
    description: {
      data: `
    You can use the buttons to save and restore the column widths. When restoring,
    you will see a quick flash because the entire table is re-rendered. This
    mimics what would happen if an app reloaded the whole page and restored a saved
    column width state. This is a "some widths" controlled story. It cannot restore
    the widths of the columns that it does not manage. Height and weight are uncontrolled.
  `}
  }
};

let columnsFR: PokemonColumn[] = [
  {name: 'Name', id: 'name', width: '1fr', isRowHeader: true},
  {name: 'Type', id: 'type', width: '1fr'},
  {name: 'Level', id: 'level', width: '4fr'}
];

export const ResizingControlledAllInitialWidths: TableStory = {
  render: (args) => (
    <ControllingResize {...args} width={900} columns={columnsFR} />
  ),
  name: 'allowsResizing, controlled, all widths',
  parameters: {
    description: {
      data: `
    You can use the buttons to save and restore the column widths. When restoring,
    you will see a quick flash because the entire table is re-rendered. This
    mimics what would happen if an app reloaded the whole page and restored a saved
    column width state.
  `}
  }
};

let columnsFRHideHeaders: PokemonColumn[] = [
  {name: 'Name', id: 'name', hideHeader: true, isRowHeader: true},
  {name: 'Type', id: 'type', width: 300, hideHeader: true},
  {name: 'Level', id: 'level', width: '4fr'}
];

export const ResizingControlledHideHeader: TableStory = {
  render: (args) => (
    <ControllingResize {...args} width={900} columns={columnsFRHideHeaders} />
  ),
  name: 'allowsResizing, controlled, hideHeader',
  parameters: {
    description: {
      data: `
    Hide headers columns should not be resizable.
  `}
  }
};

let typeAheadColumns = [
  {name: 'First Name', id: 'firstname', isRowHeader: true},
  {name: 'Last Name', id: 'lastname', isRowHeader: true},
  {name: 'Birthday', id: 'birthday'},
  {name: 'Edit', id: 'edit'}
];
let typeAheadRows = [
  ...Array.from({length: 100}, (v, i) => ({id: i, firstname: 'Aubrey', lastname: 'Sheppard', birthday: 'May 7'})),
  {id: 101, firstname: 'John', lastname: 'Doe', birthday: 'May 7'}
];
export const TypeaheadWithDialog: TableStory = {
  render: (args) => (
    <div style={{height: '90vh'}}>
      <TableView aria-label="Table" selectionMode="none" height="100%" {...args}>
        <TableHeader columns={typeAheadColumns}>
          {(col) => (
            <Column key={col.id} isRowHeader={col.isRowHeader}>{col.name}</Column>
          )}
        </TableHeader>
        <TableBody items={typeAheadRows}>
          {(item) => (
            <Row columns={typeAheadColumns}>
              {column =>
                column.id === 'edit' ? (
                  <Cell>
                    <DialogTrigger>
                      <ActionButton aria-label="Add Info">
                        <Add />
                      </ActionButton>
                      <Dialog>
                        <Heading>Add Info</Heading>
                        <Divider />
                        <Content>
                          <TextField label="Enter a J" />
                        </Content>
                      </Dialog>
                    </DialogTrigger>
                  </Cell>
                ) : (
                  <Cell>{item[column.id]}</Cell>
                )
              }
            </Row>
          )}
        </TableBody>
      </TableView>
    </div>
  )
};
