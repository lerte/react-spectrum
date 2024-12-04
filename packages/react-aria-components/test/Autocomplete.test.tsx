/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaAutocompleteTests} from './AriaAutocomplete.test-util';
import {Header, Input, Label, ListBox, ListBoxItem, ListBoxSection, Menu, MenuItem, MenuSection, SearchField, Separator, Text, UNSTABLE_Autocomplete} from '..';
import React, {ReactNode} from 'react';
import {render} from '@react-spectrum/test-utils-internal';

interface AutocompleteItem {
  id: string,
  name: string
}

let items: AutocompleteItem[] = [{id: '1', name: 'Foo'}, {id: '2', name: 'Bar'}, {id: '3', name: 'Baz'}];
let onAction = jest.fn();
let onSelectionChange = jest.fn();

let StaticMenu = (props) => (
  <Menu {...props}>
    <MenuItem id="1">Foo</MenuItem>
    <MenuItem id="2">Bar</MenuItem>
    <MenuItem id="3">Baz</MenuItem>
  </Menu>
);

let DynamicMenu = (props) => (
  <Menu {...props} items={items}>
    {(item: AutocompleteItem) => <MenuItem id={item.id}>{item.name}</MenuItem>}
  </Menu>
);

let MenuWithLinks = (props) => (
  <Menu {...props}>
    <MenuItem id="1">Foo</MenuItem>
    <MenuItem id="2">Bar</MenuItem>
    <MenuItem id="3" href="https://google.com">Google</MenuItem>
  </Menu>
);

let MenuWithSections = (props) => (
  <Menu {...props}>
    <MenuSection id="sec1">
      <Header>MenuSection 1</Header>
      <MenuItem id="1">Foo</MenuItem>
      <MenuItem id="2">Bar</MenuItem>
      <MenuItem id="3">Baz</MenuItem>
    </MenuSection>
    <Separator />
    <MenuSection id="sec2">
      <Header>MenuSection 2</Header>
      <MenuItem id="4">Copy</MenuItem>
      <MenuItem id="5">Cut</MenuItem>
      <MenuItem id="6">Paste</MenuItem>
    </MenuSection>
  </Menu>
);

let StaticListbox = (props) => (
  <ListBox {...props}>
    <ListBoxItem id="1">Foo</ListBoxItem>
    <ListBoxItem id="2">Bar</ListBoxItem>
    <ListBoxItem id="3">Baz</ListBoxItem>
  </ListBox>
);

let ListBoxWithLinks = (props) => (
  <ListBox {...props}>
    <ListBoxItem id="1">Foo</ListBoxItem>
    <ListBoxItem id="2">Bar</ListBoxItem>
    <ListBoxItem id="3" href="https://google.com">Google</ListBoxItem>
  </ListBox>
);

let ListBoxWithSections = (props) => (
  <ListBox {...props}>
    <ListBoxSection id="sec1">
      <Header>ListBox Section 1</Header>
      <ListBoxItem id="1">Foo</ListBoxItem>
      <ListBoxItem id="2">Bar</ListBoxItem>
      <ListBoxItem id="3">Baz</ListBoxItem>
    </ListBoxSection>
    <Separator />
    <ListBoxSection id="sec2">
      <Header>ListBox Section 2</Header>
      <ListBoxItem id="4">Copy</ListBoxItem>
      <ListBoxItem id="5">Cut</ListBoxItem>
      <ListBoxItem id="6">Paste</ListBoxItem>
    </ListBoxSection>
  </ListBox>
);

let AutocompleteWrapper = ({autocompleteProps = {}, inputProps = {}, children}: {autocompleteProps?: any, inputProps?: any, collectionProps?: any, children?: ReactNode}) => (
  <UNSTABLE_Autocomplete {...autocompleteProps}>
    <SearchField {...inputProps}>
      <Label style={{display: 'block'}}>Test</Label>
      <Input />
      <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
    </SearchField>
    {children}
  </UNSTABLE_Autocomplete>
);

let ControlledAutocomplete = ({autocompleteProps = {}, inputProps = {}, children}: {autocompleteProps?: any, inputProps?: any, collectionProps?: any, children?: ReactNode}) => {
  let [inputValue, setInputValue] = React.useState('');

  return (
    <UNSTABLE_Autocomplete inputValue={inputValue} onInputChange={setInputValue} {...autocompleteProps}>
      <SearchField {...inputProps}>
        <Label style={{display: 'block'}}>Test</Label>
        <Input />
        <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
      </SearchField>
      {children}
    </UNSTABLE_Autocomplete>
  );
};

AriaAutocompleteTests({
  prefix: 'rac-static-menu',
  renderers: {
    standard: () => render(
      <AutocompleteWrapper>
        <StaticMenu />
      </AutocompleteWrapper>
    ),
    links: () => render(
      <AutocompleteWrapper>
        <MenuWithLinks />
      </AutocompleteWrapper>
    ),
    sections: () => render(
      <AutocompleteWrapper>
        <MenuWithSections />
      </AutocompleteWrapper>
    ),
    controlled: () => render(
      <ControlledAutocomplete>
        <StaticMenu />
      </ControlledAutocomplete>
    ),
    itemActions: () => render(
      <AutocompleteWrapper>
        <StaticMenu onAction={onAction} />
      </AutocompleteWrapper>
    ),
    multipleSelection: () => render(
      <AutocompleteWrapper>
        <StaticMenu selectionMode="multiple" onSelectionChange={onSelectionChange} />
      </AutocompleteWrapper>
    ),
    disabledItems: () => render(
      <AutocompleteWrapper>
        <StaticMenu onAction={onAction} disabledKeys={['2']} />
      </AutocompleteWrapper>
    ),
    defaultValue: () => render(
      <AutocompleteWrapper autocompleteProps={{defaultInputValue: 'Ba'}}>
        <StaticMenu />
      </AutocompleteWrapper>
    ),
    customFiltering: () => render(
      <AutocompleteWrapper autocompleteProps={{defaultFilter: () => true}}>
        <StaticMenu />
      </AutocompleteWrapper>
    )
  },
  actionListener: onAction,
  selectionListener: onSelectionChange
});

AriaAutocompleteTests({
  prefix: 'rac-dynamic-menu',
  renderers: {
    standard: () => render(
      <AutocompleteWrapper>
        <DynamicMenu />
      </AutocompleteWrapper>
    )
  }
});

AriaAutocompleteTests({
  prefix: 'rac-static-listbox',
  renderers: {
    standard: () => render(
      <AutocompleteWrapper>
        <StaticListbox />
      </AutocompleteWrapper>
    ),
    links: () => render(
      <AutocompleteWrapper>
        <ListBoxWithLinks />
      </AutocompleteWrapper>
    ),
    sections: () => render(
      <AutocompleteWrapper>
        <ListBoxWithSections />
      </AutocompleteWrapper>
    ),
    controlled: () => render(
      <ControlledAutocomplete>
        <StaticListbox />
      </ControlledAutocomplete>
    ),
    multipleSelection: () => render(
      <AutocompleteWrapper>
        <StaticListbox selectionMode="multiple" onSelectionChange={onSelectionChange} />
      </AutocompleteWrapper>
    ),
    disabledItems: () => render(
      <AutocompleteWrapper>
        <StaticListbox onAction={onAction} disabledKeys={['2']} />
      </AutocompleteWrapper>
    ),
    defaultValue: () => render(
      <AutocompleteWrapper autocompleteProps={{defaultInputValue: 'Ba'}}>
        <StaticListbox />
      </AutocompleteWrapper>
    ),
    customFiltering: () => render(
      <AutocompleteWrapper autocompleteProps={{defaultFilter: () => true}}>
        <StaticListbox />
      </AutocompleteWrapper>
    )
  },
  ariaPattern: 'listbox',
  actionListener: onAction,
  selectionListener: onSelectionChange
});
