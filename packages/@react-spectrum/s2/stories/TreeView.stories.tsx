/**
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {categorizeArgTypes} from './utils';
import FileTxt from '../s2wf-icons/S2_Icon_FileText_20_N.svg';
// import Add from '../s2wf-icons/S2_Icon_Add_20_N.svg';
// import Delete from '../s2wf-icons/S2_Icon_Delete_20_N.svg';
// import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import type {Meta} from '@storybook/react';
import React from 'react';
import {
  // ActionMenu,
  // MenuItem,
  // Content,
  // Heading,
  Text,
  // IllustratedMessage,
  // Link,
  TreeView,
  TreeViewItem
} from '../src';

let onActionFunc = action('onAction');
let noOnAction = null;
const onActionOptions = {onActionFunc, noOnAction};


const meta: Meta<typeof TreeView> = {
  component: TreeView,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    // Make sure onAction isn't autogenerated
    // @ts-ignore
    onAction: null
  },
  argTypes: {
    ...categorizeArgTypes('Events', ['onAction', 'onSelectionChange']),
    onAction: {
      options: Object.keys(onActionOptions), // An array of serializable values
      mapping: onActionOptions, // Maps serializable option values to complex arg values
      control: {
        type: 'select', // Type 'select' is automatically inferred when 'options' is defined
        labels: {
          // 'labels' maps option values to string labels
          onActionFunc: 'onAction enabled',
          noOnAction: 'onAction disabled'
        }
      },
      table: {category: 'Events'}
    }
  }
};

export default meta;

const TreeExampleStatic = (args) => (
  <div style={{width: '300px', resize: 'both', height: '90vh', overflow: 'auto'}}>
    <TreeView
      {...args}
      disabledKeys={['projects-1']}
      aria-label="test static tree"
      onExpandedChange={action('onExpandedChange')}
      onSelectionChange={action('onSelectionChange')}>
      <TreeViewItem id="Photos" textValue="Photos">
        <Text>Photos</Text>
        <Folder />
        {/* <ActionGroup onAction={action('onActionGroup action')}>
          <MenuItem key="edit">
            <Edit />
            <Text>Edit</Text>
          </MenuItem>
          <MenuItem key="delete">
            <Delete />
            <Text>Delete</Text>
          </MenuItem>
        </ActionGroup> */}
      </TreeViewItem>
      <TreeViewItem id="projects" textValue="Projects">
        <Text>Projects</Text>
        <Folder />
        {/* <ActionGroup onAction={action('onActionGroup action')}>
          <MenuItem key="edit">
            <Edit />
            <Text>Edit</Text>
          </MenuItem>
          <MenuItem key="delete">
            <Delete />
            <Text>Delete</Text>
          </MenuItem>
        </ActionGroup> */}
        <TreeViewItem id="projects-1" textValue="Projects-1">
          <Text>Projects-1</Text>
          <Folder />
          {/* <ActionGroup onAction={action('onActionGroup action')}>
            <MenuItem key="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem key="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionGroup> */}
          <TreeViewItem id="projects-1A" textValue="Projects-1A">
            <Text>Projects-1A</Text>
            <FileTxt />
            {/* <ActionGroup onAction={action('onActionGroup action')}>
              <MenuItem key="edit">
                <Edit />
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem key="delete">
                <Delete />
                <Text>Delete</Text>
              </MenuItem>
            </ActionGroup> */}
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem id="projects-2" textValue="Projects-2">
          <Text>Projects-2</Text>
          <FileTxt />
          {/* <ActionGroup onAction={action('onActionGroup action')}>
            <MenuItem key="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem key="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionGroup> */}
        </TreeViewItem>
        <TreeViewItem id="projects-3" textValue="Projects-3">
          <Text>Projects-3</Text>
          <FileTxt />
          {/* <ActionGroup onAction={action('onActionGroup action')}>
            <MenuItem key="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem key="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionGroup> */}
        </TreeViewItem>
      </TreeViewItem>
    </TreeView>
  </div>
);

export const Example = {
  render: TreeExampleStatic,
  args: {
    selectionMode: 'multiple'
  }
};

let rows = [
  {id: 'projects', name: 'Projects', icon: <Folder />, childItems: [
    {id: 'project-1', name: 'Project 1', icon: <FileTxt />},
    {id: 'project-2', name: 'Project 2', icon: <Folder />, childItems: [
      {id: 'project-2A', name: 'Project 2A', icon: <FileTxt />},
      {id: 'project-2B', name: 'Project 2B', icon: <FileTxt />},
      {id: 'project-2C', name: 'Project 2C', icon: <FileTxt />}
    ]},
    {id: 'project-3', name: 'Project 3', icon: <FileTxt />},
    {id: 'project-4', name: 'Project 4', icon: <FileTxt />},
    {id: 'project-5', name: 'Project 5', icon: <Folder />, childItems: [
      {id: 'project-5A', name: 'Project 5A', icon: <FileTxt />},
      {id: 'project-5B', name: 'Project 5B', icon: <FileTxt />},
      {id: 'project-5C', name: 'Project 5C', icon: <FileTxt />}
    ]}
  ]},
  {id: 'reports', name: 'Reports', icon: <Folder />, childItems: [
    {id: 'reports-1', name: 'Reports 1', icon: <Folder />, childItems: [
      {id: 'reports-1A', name: 'Reports 1A', icon: <Folder />, childItems: [
        {id: 'reports-1AB', name: 'Reports 1AB', icon: <Folder />, childItems: [
          {id: 'reports-1ABC', name: 'Reports 1ABC', icon: <FileTxt />}
        ]}
      ]},
      {id: 'reports-1B', name: 'Reports 1B', icon: <FileTxt />},
      {id: 'reports-1C', name: 'Reports 1C', icon: <FileTxt />}
    ]},
    {id: 'reports-2', name: 'Reports 2', icon: <FileTxt />}
  ]}
];

const TreeExampleDynamic = (args) => (
  <div style={{width: '300px', resize: 'both', height: '90vh', overflow: 'auto'}}>
    <TreeView disabledKeys={['reports-1AB']} aria-label="test dynamic tree" items={rows} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')} {...args}>
      {(item: any) => (
        <TreeViewItem childItems={item.childItems} textValue={item.name}>
          <Text>{item.name}</Text>
          {item.icon}
          {/* <ActionGroup onAction={action('onActionGroup action')}>
            <MenuItem key="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem key="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionGroup> */}
        </TreeViewItem>
      )}
    </TreeView>
  </div>
);

export const Dynamic = {
  render: TreeExampleDynamic,
  args: {
    ...Example.args,
    disabledKeys: ['Foo 5']
  }
};
