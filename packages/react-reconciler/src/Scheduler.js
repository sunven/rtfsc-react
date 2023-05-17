/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// This module only exists as an ESM wrapper around the external CommonJS
// Scheduler dependency. Notice that we're intentionally not using named imports
// because Rollup would use dynamic dispatch for CommonJS interop named imports.
// When we switch to ESM, we can delete this module.
import * as Scheduler from 'scheduler';

export const scheduleCallback = Scheduler.unstable_scheduleCallback;
export const cancelCallback = Scheduler.unstable_cancelCallback;
export const shouldYield = Scheduler.unstable_shouldYield;
export const requestPaint = Scheduler.unstable_requestPaint;
export const now = Scheduler.unstable_now;
export const getCurrentPriorityLevel =
  Scheduler.unstable_getCurrentPriorityLevel;

// 立即优先级 用于处理紧急事件，例如用户输入
export const ImmediatePriority = Scheduler.unstable_ImmediatePriority;
// 用户阻塞优先级 滚动等事件
export const UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
// 默认
export const NormalPriority = Scheduler.unstable_NormalPriority;
export const LowPriority = Scheduler.unstable_LowPriority;
// 空闲
export const IdlePriority = Scheduler.unstable_IdlePriority;
export type SchedulerCallback = (isSync: boolean) => SchedulerCallback | null;

// this doesn't actually exist on the scheduler, but it *does*
// on scheduler/unstable_mock, which we'll need for internal testing
export const unstable_yieldValue = Scheduler.unstable_yieldValue;
export const unstable_setDisableYieldValue =
  Scheduler.unstable_setDisableYieldValue;
