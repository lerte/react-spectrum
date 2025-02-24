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

import {AriaLabelingProps, BaseEvent, DOMProps, RefObject} from '@react-types/shared';
import {AutocompleteProps, AutocompleteState} from '@react-stately/autocomplete';
import {ChangeEvent, InputHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useMemo, useRef} from 'react';
import {CLEAR_FOCUS_EVENT, FOCUS_EVENT, mergeProps, mergeRefs, UPDATE_ACTIVEDESCENDANT, useEffectEvent, useId, useLabels, useObjectRef} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useFilter, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useKeyboard} from '@react-aria/interactions';

export interface CollectionOptions extends DOMProps, AriaLabelingProps {
  /** Whether the collection items should use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus: boolean,
  /** Whether typeahead is disabled. */
  disallowTypeAhead: boolean
}
export interface AriaAutocompleteProps extends AutocompleteProps {
  /**
   * The filter function used to determine if a option should be included in the autocomplete list.
   * @default contains
   */
  defaultFilter?: (textValue: string, inputValue: string) => boolean
}

export interface AriaAutocompleteOptions extends Omit<AriaAutocompleteProps, 'children'> {
  /** The ref for the wrapped collection element. */
  collectionRef: RefObject<HTMLElement | null>,
  /** The ref for the wrapped input element. */
  inputRef: RefObject<HTMLInputElement | null>
}

export interface AutocompleteAria {
  /** Props for the autocomplete input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Props for the collection, to be passed to collection's respective aria hook (e.g. useMenu). */
  collectionProps: CollectionOptions,
  /** Ref to attach to the wrapped collection. */
  collectionRef: RefObject<HTMLElement | null>,
  /** A filter function that returns if the provided collection node should be filtered out of the collection. */
  filterFn: (nodeTextValue: string) => boolean
}

/**
 * Provides the behavior and accessibility implementation for a autocomplete component.
 * A autocomplete combines a text input with a collection, allowing users to filter the collection's contents match a query.
 * @param props - Props for the autocomplete.
 * @param state - State for the autocomplete, as returned by `useAutocompleteState`.
 */
export function useAutocomplete(props: AriaAutocompleteOptions, state: AutocompleteState): AutocompleteAria {
  let {
    collectionRef,
    defaultFilter,
    inputRef
  } = props;

  let collectionId = useId();
  let timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  let delayNextActiveDescendant = useRef(false);
  let lastCollectionNode = useRef<HTMLElement>(null);

  let updateActiveDescendant = useEffectEvent((e) => {
    let {target} = e;
    clearTimeout(timeout.current);
    e.stopPropagation();

    if (target !== collectionRef.current) {
      if (delayNextActiveDescendant.current) {
        timeout.current = setTimeout(() => {
          state.setFocusedNodeId(target.id);
        }, 500);
      } else {
        state.setFocusedNodeId(target.id);
      }
    } else {
      state.setFocusedNodeId(null);
    }

    delayNextActiveDescendant.current = false;
  });

  let callbackRef = useCallback((collectionNode) => {
    if (collectionNode != null) {
      // When typing forward, we want to delay the setting of active descendant to not interrupt the native screen reader announcement
      // of the letter you just typed. If we recieve another UPDATE_ACTIVEDESCENDANT call then we clear the queued update
      // We track lastCollectionNode to do proper cleanup since callbackRefs just pass null when unmounting. This also handles
      // React 19's extra call of the callback ref in strict mode
      lastCollectionNode.current?.removeEventListener(UPDATE_ACTIVEDESCENDANT, updateActiveDescendant);
      lastCollectionNode.current = collectionNode;
      collectionNode.addEventListener(UPDATE_ACTIVEDESCENDANT, updateActiveDescendant);
    } else {
      lastCollectionNode.current?.removeEventListener(UPDATE_ACTIVEDESCENDANT, updateActiveDescendant);
    }
  }, [updateActiveDescendant]);

  // Make sure to memo so that React doesn't keep registering a new event listeners on every rerender of the wrapped collection
  let mergedCollectionRef = useObjectRef(useMemo(() => mergeRefs(collectionRef, callbackRef), [collectionRef, callbackRef]));

  let focusFirstItem = useEffectEvent(() => {
    delayNextActiveDescendant.current = true;
    collectionRef.current?.dispatchEvent(
      new CustomEvent(FOCUS_EVENT, {
        cancelable: true,
        bubbles: true,
        detail: {
          focusStrategy: 'first'
        }
      })
    );
  });

  let clearVirtualFocus = useEffectEvent(() => {
    state.setFocusedNodeId(null);
    let clearFocusEvent = new CustomEvent(CLEAR_FOCUS_EVENT, {
      cancelable: true,
      bubbles: true
    });
    clearTimeout(timeout.current);
    delayNextActiveDescendant.current = false;
    collectionRef.current?.dispatchEvent(clearFocusEvent);
  });

  // Tell wrapped collection to focus the first element in the list when typing forward and to clear focused key when deleting text
  // for screen reader announcements
  let lastInputValue = useRef<string | null>(null);
  useEffect(() => {
    if (state.inputValue != null) {
      if (lastInputValue.current != null && lastInputValue.current !== state.inputValue && lastInputValue.current?.length <= state.inputValue.length) {
        focusFirstItem();
      } else {
        clearVirtualFocus();
      }

      lastInputValue.current = state.inputValue;
    }
  }, [state.inputValue, focusFirstItem, clearVirtualFocus]);

  // For textfield specific keydown operations
  let onKeyDown = (e: BaseEvent<ReactKeyboardEvent<any>>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    switch (e.key) {
      case 'Escape':
        // Early return for Escape here so it doesn't leak the Escape event from the simulated collection event below and
        // close the dialog prematurely. Ideally that should be up to the discretion of the input element hence the check
        // for isPropagationStopped
        if (e.isPropagationStopped()) {
          return;
        }
        break;
      case ' ':
        // Space shouldn't trigger onAction so early return.

        return;
      case 'Home':
      case 'End':
      case 'PageDown':
      case 'PageUp':
      case 'ArrowUp':
      case 'ArrowDown': {
        if ((e.key === 'Home' || e.key === 'End') && state.focusedNodeId == null && e.shiftKey) {
          return;
        }

        // Prevent these keys from moving the text cursor in the input
        e.preventDefault();
        // Move virtual focus into the wrapped collection
        let focusCollection = new CustomEvent(FOCUS_EVENT, {
          cancelable: true,
          bubbles: true
        });

        collectionRef.current?.dispatchEvent(focusCollection);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowRight':
        // TODO: will need to special case this so it doesn't clear the focused key if we are currently
        // focused on a submenutrigger? May not need to since focus would
        // But what about wrapped grids where ArrowLeft and ArrowRight should navigate left/right
        clearVirtualFocus();
        break;
    }

    // Emulate the keyboard events that happen in the input field in the wrapped collection. This is for triggering things like onAction via Enter
    // or moving focus from one item to another
    if (state.focusedNodeId == null) {
      collectionRef.current?.dispatchEvent(
        new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
      );
    } else {
      let item = document.getElementById(state.focusedNodeId);
      item?.dispatchEvent(
        new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
      );
    }
  };

  let onKeyUp = useEffectEvent((e) => {
    // Dispatch simulated key up events for things like triggering links in listbox
    // Make sure to stop the propagation of the input keyup event so that the simulated keyup/down pair
    // is detected by usePress instead of the original keyup originating from the input
    if (e.target === inputRef.current) {
      e.stopImmediatePropagation();
      if (state.focusedNodeId == null) {
        collectionRef.current?.dispatchEvent(
          new KeyboardEvent(e.type, e)
        );
      } else {
        let item = document.getElementById(state.focusedNodeId);
        item?.dispatchEvent(
          new KeyboardEvent(e.type, e)
        );
      }
    }
  });

  useEffect(() => {
    document.addEventListener('keyup', onKeyUp, true);
    return () => {
      document.removeEventListener('keyup', onKeyUp, true);
    };
  }, [inputRef, onKeyUp]);

  let {keyboardProps} = useKeyboard({onKeyDown});

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/autocomplete');
  let collectionProps = useLabels({
    id: collectionId,
    'aria-label': stringFormatter.format('collectionLabel')
  });

  let {contains} = useFilter({sensitivity: 'base'});
  let filterFn = useCallback((nodeTextValue: string) => {
    if (defaultFilter) {
      return defaultFilter(nodeTextValue, state.inputValue);
    }

    return contains(nodeTextValue, state.inputValue);
  }, [state.inputValue, defaultFilter, contains]) ;

  return {
    inputProps: {
      value: state.inputValue,
      onChange: (e: ChangeEvent<HTMLInputElement>) => state.setInputValue(e.target.value),
      ...keyboardProps,
      autoComplete: 'off',
      'aria-haspopup': 'listbox',
      'aria-controls': collectionId,
      // TODO: readd proper logic for completionMode = complete (aria-autocomplete: both)
      'aria-autocomplete': 'list',
      'aria-activedescendant': state.focusedNodeId ?? undefined,
      // This disable's iOS's autocorrect suggestions, since the autocomplete provides its own suggestions.
      autoCorrect: 'off',
      // This disable's the macOS Safari spell check auto corrections.
      spellCheck: 'false'
    },
    collectionProps: mergeProps(collectionProps, {
      // TODO: shouldFocusOnHover? shouldFocusWrap? Should it be up to the wrapped collection?
      shouldUseVirtualFocus: true,
      disallowTypeAhead: true
    }),
    collectionRef: mergedCollectionRef,
    filterFn
  };
}
