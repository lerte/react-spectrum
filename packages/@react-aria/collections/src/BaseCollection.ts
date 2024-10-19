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

import {Collection as ICollection, Key, Node} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export type Mutable<T> = {
  -readonly[P in keyof T]: T[P]
}

/** An immutable object representing a Node in a Collection. */
export class CollectionNode<T> implements Node<T> {
  readonly type: string;
  readonly key: Key;
  readonly value: T | null = null;
  readonly level: number = 0;
  readonly hasChildNodes: boolean = false;
  readonly rendered: ReactNode = null;
  readonly textValue: string = '';
  readonly 'aria-label'?: string = undefined;
  readonly index: number = 0;
  readonly parentKey: Key | null = null;
  readonly prevKey: Key | null = null;
  readonly nextKey: Key | null = null;
  readonly firstChildKey: Key | null = null;
  readonly lastChildKey: Key | null = null;
  readonly props: any = {};
  readonly render?: (node: Node<any>) => ReactElement;

  constructor(type: string, key: Key) {
    this.type = type;
    this.key = key;
  }

  get childNodes(): Iterable<Node<T>> {
    throw new Error('childNodes is not supported');
  }

  clone(): CollectionNode<T> {
    let node: Mutable<CollectionNode<T>> = new CollectionNode(this.type, this.key);
    node.value = this.value;
    node.level = this.level;
    node.hasChildNodes = this.hasChildNodes;
    node.rendered = this.rendered;
    node.textValue = this.textValue;
    node['aria-label'] = this['aria-label'];
    node.index = this.index;
    node.parentKey = this.parentKey;
    node.prevKey = this.prevKey;
    node.nextKey = this.nextKey;
    node.firstChildKey = this.firstChildKey;
    node.lastChildKey = this.lastChildKey;
    node.props = this.props;
    node.render = this.render;
    return node;
  }
}

/**
 * An immutable Collection implementation. Updates are only allowed
 * when it is not marked as frozen. This can be subclassed to implement
 * custom collection behaviors.
 */
export class BaseCollection<T> implements ICollection<Node<T>> {
  private keyMap: Map<Key, CollectionNode<T>> = new Map();
  private firstKey: Key | null = null;
  private lastKey: Key | null = null;
  private frozen = false;

  get size() {
    return this.keyMap.size;
  }

  getKeys() {
    return this.keyMap.keys();
  }

  *[Symbol.iterator]() {
    let node: Node<T> | undefined = this.firstKey != null ? this.keyMap.get(this.firstKey) : undefined;
    while (node) {
      yield node;
      node = node.nextKey != null ? this.keyMap.get(node.nextKey) : undefined;
    }
  }

  getChildren(key: Key): Iterable<Node<T>> {
    let keyMap = this.keyMap;
    return {
      *[Symbol.iterator]() {
        let parent = keyMap.get(key);
        let node = parent?.firstChildKey != null ? keyMap.get(parent.firstChildKey) : null;
        while (node) {
          yield node as Node<T>;
          node = node.nextKey != null ? keyMap.get(node.nextKey) : undefined;
        }
      }
    };
  }

  getKeyBefore(key: Key) {
    let node = this.keyMap.get(key);
    if (!node) {
      return null;
    }

    if (node.prevKey != null) {
      node = this.keyMap.get(node.prevKey);

      while (node && node.type !== 'item' && node.lastChildKey != null) {
        node = this.keyMap.get(node.lastChildKey);
      }

      return node?.key ?? null;
    }

    return node.parentKey;
  }

  getKeyAfter(key: Key) {
    let node = this.keyMap.get(key);
    if (!node) {
      return null;
    }

    if (node.type !== 'item' && node.firstChildKey != null) {
      return node.firstChildKey;
    }

    while (node) {
      if (node.nextKey != null) {
        return node.nextKey;
      }

      if (node.parentKey != null) {
        node = this.keyMap.get(node.parentKey);
      } else {
        return null;
      }
    }

    return null;
  }

  getFirstKey() {
    return this.firstKey;
  }

  getLastKey() {
    let node = this.lastKey != null ? this.keyMap.get(this.lastKey) : null;
    while (node?.lastChildKey != null) {
      node = this.keyMap.get(node.lastChildKey);
    }

    return node?.key ?? null;
  }

  getItem(key: Key): Node<T> | null {
    return this.keyMap.get(key) ?? null;
  }

  at(): Node<T> {
    throw new Error('Not implemented');
  }

  clone(): this {
    // We need to clone using this.constructor so that subclasses have the right prototype.
    // TypeScript isn't happy about this yet.
    // https://github.com/microsoft/TypeScript/issues/3841
    let Constructor: any = this.constructor;
    let collection: this = new Constructor();
    collection.keyMap = new Map(this.keyMap);
    collection.firstKey = this.firstKey;
    collection.lastKey = this.lastKey;
    return collection;
  }

  addNode(node: CollectionNode<T>) {
    if (this.frozen) {
      throw new Error('Cannot add a node to a frozen collection');
    }

    this.keyMap.set(node.key, node);
  }

  removeNode(key: Key) {
    if (this.frozen) {
      throw new Error('Cannot remove a node to a frozen collection');
    }

    this.keyMap.delete(key);
  }

  commit(firstKey: Key | null, lastKey: Key | null, isSSR = false) {
    if (this.frozen) {
      throw new Error('Cannot commit a frozen collection');
    }

    this.firstKey = firstKey;
    this.lastKey = lastKey;
    this.frozen = !isSSR;
  }

  // TODO: this is pretty specific to menu, will need to check if it is generic enough
  // Will need to handle varying levels I assume but will revisit after I get searchable menu working for base menu
  // TODO: an alternative is to simply walk the collection and add all item nodes that match the filter and any sections/separators we encounter
  // to an array, then walk that new array and fix all the next/Prev keys while adding them to the new collection
  filter(filterFn: (nodeValue: string) => boolean): BaseCollection<T> {
    let newCollection = new BaseCollection<T>();
    // console.log('new', newCollection,);
    // This tracks the last non-section item
    let lastItem: Mutable<CollectionNode<T>>;
    // This tracks the absolute last item in the collection
    let lastNode: Mutable<CollectionNode<T>>;
    let lastSeparator: Mutable<CollectionNode<T>>;

    for (let node of this) {
      // console.log('node', node)
      if (node.type === 'section' && node.hasChildNodes) {
        let clonedSection: Mutable<CollectionNode<T>> = (node as CollectionNode<T>).clone();
        let lastChildInSection: Mutable<CollectionNode<T>>;
        for (let child of this.getChildren(node.key)) {
          if (filterFn(child.textValue)) {
            let clonedChild: Mutable<CollectionNode<T>> = (child as CollectionNode<T>).clone();
            // eslint-disable-next-line max-depth
            if (lastChildInSection == null) {
              clonedSection.firstChildKey = clonedChild.key;
            }

            // eslint-disable-next-line max-depth
            if (newCollection.firstKey == null) {
              newCollection.firstKey = clonedSection.key;
            }

            // eslint-disable-next-line max-depth
            if (lastChildInSection && lastChildInSection.parentKey === clonedChild.parentKey) {
              lastChildInSection.nextKey = clonedChild.key;
              clonedChild.prevKey = lastChildInSection.key;
            } else {
              clonedChild.prevKey = null;
            }

            clonedChild.nextKey = null;
            newCollection.addNode(clonedChild);
            lastChildInSection = clonedChild;
          }
        }

        if (lastChildInSection && lastChildInSection.type !== 'header') {
          clonedSection.lastChildKey = lastChildInSection.key;

          // If the old prev section was filtered out, will need to attach to whatever came before
          if (lastNode == null) {
            clonedSection.prevKey = null;
          } else if (lastNode.type === 'section' || lastNode.type === 'separator') {
            lastNode.nextKey = clonedSection.key;
            clonedSection.prevKey = lastNode.key;
          }
          clonedSection.nextKey = null;
          lastNode = clonedSection;
          newCollection.addNode(clonedSection);
        }
      } else if (node.type === 'separator') {
        // will need to check if previous section key exists, if it does then we add. After the full collection is created we'll need to remove it
        let clonedSeparator: Mutable<CollectionNode<T>> = (node as CollectionNode<T>).clone();
        clonedSeparator.nextKey = null;
        if (lastNode?.type === 'section') {
          lastNode.nextKey = clonedSeparator.key;
          clonedSeparator.prevKey = lastNode.key;
          lastNode = clonedSeparator;
          lastSeparator = clonedSeparator;
          newCollection.addNode(clonedSeparator);
        }
      } else if (filterFn(node.textValue)) {
        let clonedNode: Mutable<CollectionNode<T>> = (node as CollectionNode<T>).clone();
        if (newCollection.firstKey == null) {
          newCollection.firstKey = clonedNode.key;
        }

        if (lastItem && lastItem.parentKey === clonedNode.parentKey) {
          lastItem.nextKey = clonedNode.key;
          clonedNode.prevKey = lastItem.key;
        } else {
          clonedNode.prevKey = null;
        }

        clonedNode.nextKey = null;
        newCollection.addNode(clonedNode);
        lastItem = clonedNode;
        lastNode = clonedNode;
      }
    }

    if (lastSeparator && lastSeparator.nextKey === null) {
      if (lastSeparator.prevKey != null) {
        let lastSection = newCollection.getItem(lastSeparator.prevKey) as Mutable<CollectionNode<T>>;
        lastSection.nextKey = null;

        if (lastNode.key === lastSeparator.key) {
          // TODO: If the last node was the last tracked separator, then we can say the last node was the
          // last section because the separator can only have a section as its previous node, not a menu item
          // Is this a reasonable assumption?
          lastNode = lastSection;
        }

      }
      newCollection.removeNode(lastSeparator.key);
    }

    newCollection.lastKey = lastNode?.key;

    // for (let node of this) {
    //   // console.log('node', node)
    //   if (node.type === 'section' && node.hasChildNodes && lastNodeWithParent?.parentKey === node.key) {
    //     let clonedSection: Mutable<CollectionNode<T>> = (node as CollectionNode<T>).clone();
    //     clonedSection.firstChildKey = lastNodeWithParent.key;
    //     // TODO: This makes use of the assumption that if we encountered a section with a matching key as our lastNodeWithParent that the last node added to the cloned BaseCollection
    //     // Will need to double check if valid
    //     clonedSection.lastChildKey = newCollection.lastKey;

    //     // If the prev section was filtered out, will need to attach to whatever came before
    //     if (lastSectionOrSeparator == null) {
    //       clonedSection.prevKey = null;
    //     } else {
    //       lastSectionOrSeparator.nextKey = clonedSection.key;
    //       clonedSection.prevKey = lastSectionOrSeparator.key;
    //     }
    //     clonedSection.nextKey = null;
    //     lastSectionOrSeparator = clonedSection;
    //     newCollection.addNode(clonedSection);
    //   } else if (node.type === 'separator') {
    //     // will need to check if previous section key exists, if it does then we add. After the full collection is created
    //     let clonedSeparator: Mutable<CollectionNode<T>> = (node as CollectionNode<T>).clone();
    //     clonedSeparator.nextKey = null;
    //     if (lastSectionOrSeparator?.type === 'section') {
    //       lastSectionOrSeparator.nextKey = clonedSeparator.key;
    //       clonedSeparator.prevKey = lastSectionOrSeparator.key;
    //       lastSectionOrSeparator = clonedSeparator;
    //       newCollection.addNode(clonedSeparator);
    //     }
    //   } else if (filterFn(node.textValue)) {
    //     let clonedNode: Mutable<CollectionNode<T>> = (node as CollectionNode<T>).clone();
    //     let parentKey = node.parentKey;

    //     if (lastNode && lastNode.parentKey === clonedNode.parentKey) {
    //       lastNode.nextKey = clonedNode.key;
    //       clonedNode.prevKey = lastNode.key;
    //     } else {
    //       clonedNode.prevKey = null;
    //     }

    //     clonedNode.nextKey = null;
    //     newCollection.addNode(clonedNode);
    //     lastNode = clonedNode;
    //     if (parentKey != null) {
    //       lastNodeWithParent = clonedNode;
    //     }
    //   }
    // }

    return newCollection;
  }

}
