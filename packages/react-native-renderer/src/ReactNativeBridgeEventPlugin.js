/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {AnyNativeEvent} from './legacy-events/PluginModuleType';
import type {TopLevelType} from './legacy-events/TopLevelEventTypes';
import SyntheticEvent from './legacy-events/SyntheticEvent';
import type {PropagationPhases} from './legacy-events/PropagationPhases';

// Module provided by RN:
import {ReactNativeViewConfigRegistry} from 'react-native/Libraries/ReactPrivate/ReactNativePrivateInterface';
import accumulateInto from './legacy-events/accumulateInto';
import getListeners from './ReactNativeGetListeners';
import forEachAccumulated from './legacy-events/forEachAccumulated';
import {HostComponent} from 'react-reconciler/src/ReactWorkTags';
import isArray from 'shared/isArray';

const {
  customBubblingEventTypes,
  customDirectEventTypes,
} = ReactNativeViewConfigRegistry;

// Start of inline: the below functions were inlined from
// EventPropagator.js, as they deviated from ReactDOM's newer
// implementations.
function listenersAtPhase(inst, event, propagationPhase: PropagationPhases) {
  const registrationName =
    event.dispatchConfig.phasedRegistrationNames[propagationPhase];
  return getListeners(inst, registrationName, propagationPhase, true);
}

function accumulateListenersAndInstances(inst, event, listeners) {
  const listenersLength = listeners
    ? isArray(listeners)
      ? listeners.length
      : 1
    : 0;
  if (listenersLength > 0) {
    event._dispatchListeners = accumulateInto(
      event._dispatchListeners,
      listeners,
    );

    // Avoid allocating additional arrays here
    if (event._dispatchInstances == null && listenersLength === 1) {
      event._dispatchInstances = inst;
    } else {
      event._dispatchInstances = event._dispatchInstances || [];
      if (!isArray(event._dispatchInstances)) {
        event._dispatchInstances = [event._dispatchInstances];
      }
      for (let i = 0; i < listenersLength; i++) {
        event._dispatchInstances.push(inst);
      }
    }
  }
}

function accumulateDirectionalDispatches(inst, phase, event) {
  if (__DEV__) {
    if (!inst) {
      console.error('Dispatching inst must not be null');
    }
  }
  const listeners = listenersAtPhase(inst, event, phase);
  accumulateListenersAndInstances(inst, event, listeners);
}

function getParent(inst) {
  do {
    inst = inst.return;
    // TODO: If this is a HostRoot we might want to bail out.
    // That is depending on if we want nested subtrees (layers) to bubble
    // events to their parent. We could also go through parentNode on the
    // host node but that wouldn't work for React Native and doesn't let us
    // do the portal feature.
  } while (inst && inst.tag !== HostComponent);
  if (inst) {
    return inst;
  }
  return null;
}

/**
 * Simulates the traversal of a two-phase, capture/bubble event dispatch.
 */
export function traverseTwoPhase(
  inst: Object,
  fn: Function,
  arg: Function,
  skipBubbling: boolean,
) {
  const path = [];
  while (inst) {
    path.push(inst);
    inst = getParent(inst);
  }
  let i;
  for (i = path.length; i-- > 0; ) {
    fn(path[i], 'captured', arg);
  }
  if (skipBubbling) {
    // Dispatch on target only
    fn(path[0], 'bubbled', arg);
  } else {
    for (i = 0; i < path.length; i++) {
      fn(path[i], 'bubbled', arg);
    }
  }
}

function accumulateTwoPhaseDispatchesSingle(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    traverseTwoPhase(
      event._targetInst,
      accumulateDirectionalDispatches,
      event,
      false,
    );
  }
}

function accumulateTwoPhaseDispatches(events) {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
}

function accumulateCapturePhaseDispatches(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    traverseTwoPhase(
      event._targetInst,
      accumulateDirectionalDispatches,
      event,
      true,
    );
  }
}

/**
 * Accumulates without regard to direction, does not look for phased
 * registration names. Same as `accumulateDirectDispatchesSingle` but without
 * requiring that the `dispatchMarker` be the same as the dispatched ID.
 */
function accumulateDispatches(
  inst: Object,
  ignoredDirection: ?boolean,
  event: Object,
): void {
  if (inst && event && event.dispatchConfig.registrationName) {
    const registrationName = event.dispatchConfig.registrationName;
    const listeners = getListeners(inst, registrationName, 'bubbled', false);
    accumulateListenersAndInstances(inst, event, listeners);
  }
}

/**
 * Accumulates dispatches on an `SyntheticEvent`, but only for the
 * `dispatchMarker`.
 * @param {SyntheticEvent} event
 */
function accumulateDirectDispatchesSingle(event: Object) {
  if (event && event.dispatchConfig.registrationName) {
    accumulateDispatches(event._targetInst, null, event);
  }
}

function accumulateDirectDispatches(events: ?(Array<Object> | Object)) {
  forEachAccumulated(events, accumulateDirectDispatchesSingle);
}

// End of inline

const ReactNativeBridgeEventPlugin = {
  eventTypes: {},

  extractEvents: function(
    topLevelType: TopLevelType,
    targetInst: null | Object,
    nativeEvent: AnyNativeEvent,
    nativeEventTarget: null | Object,
  ): ?Object {
    if (targetInst == null) {
      // Probably a node belonging to another renderer's tree.
      return null;
    }
    const bubbleDispatchConfig = customBubblingEventTypes[topLevelType];
    const directDispatchConfig = customDirectEventTypes[topLevelType];

    if (!bubbleDispatchConfig && !directDispatchConfig) {
      throw new Error(
        // $FlowFixMe - Flow doesn't like this string coercion because DOMTopLevelEventType is opaque
        `Unsupported top level event type "${topLevelType}" dispatched`,
      );
    }

    const event = SyntheticEvent.getPooled(
      bubbleDispatchConfig || directDispatchConfig,
      targetInst,
      nativeEvent,
      nativeEventTarget,
    );
    if (bubbleDispatchConfig) {
      const skipBubbling =
        event != null &&
        event.dispatchConfig.phasedRegistrationNames != null &&
        event.dispatchConfig.phasedRegistrationNames.skipBubbling;
      if (skipBubbling) {
        accumulateCapturePhaseDispatches(event);
      } else {
        accumulateTwoPhaseDispatches(event);
      }
    } else if (directDispatchConfig) {
      accumulateDirectDispatches(event);
    } else {
      return null;
    }
    return event;
  },
};

export default ReactNativeBridgeEventPlugin;
