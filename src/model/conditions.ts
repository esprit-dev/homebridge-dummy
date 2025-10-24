import { ConditionsConfig } from './types.js';
import { AccessoryState, ConditionOperator, getStateType } from './enums.js';

import { Log } from '../tools/log.js';
import { assert } from '../tools/validation.js';
import { strings } from '../i18n/i18n.js';

type Target = {
    name: string,
    identifier: string,
    conditions: ConditionsConfig,
    trigger:  () => Promise<void>,
    disableLogging: boolean,
}

export class ConditionManager {

  private readonly targets = new Map<string, Target>();
  private readonly triggersToTargets = new Map<string, string[]>();

  private readonly triggerStates = new Map<string, AccessoryState>();

  constructor(private readonly log: Log) {}

  public register(name: string, identifier: string, conditions: ConditionsConfig | undefined, trigger:  () => Promise<void>, disableLogging: boolean) {

    if (conditions === undefined) {
      return;
    }

    if (!assert(this.log, name, conditions, 'operator', 'operands')) {
      return;
    }

    let valid = true;
    for (const operand of conditions.operands) {
      valid = valid && assert(this.log, name, operand, 'accessoryId', 'accessoryState');

      if (operand.accessoryId === identifier) {
        this.log.error(strings.conditions.selfReference, name);
        valid = false;
        break;
      }
    }

    if (!valid) {
      return;
    }

    const target = { name, identifier, conditions, trigger, disableLogging };
    this.targets.set(identifier, target);

    for (const operand of conditions.operands) {
      const targetList = this.triggersToTargets.get(operand.accessoryId) ?? [];
      targetList.push(identifier);
      this.triggersToTargets.set(operand.accessoryId, targetList);
    }
  }

  public async onStateChange(triggerId: string, state: AccessoryState) {

    const targetIds = this.triggersToTargets.get(triggerId);
    if (!targetIds) {
      return;
    }

    this.triggerStates.set(triggerId, state);

    for (const targetId of targetIds) {

      const target = this.targets.get(targetId);
      if (!target) {
        throw new Error('Unable to find target associated with the supplied trigger');
      }

      this.log.ifVerbose(strings.conditions.evaluatingConditions, target.name);

      if (this.evaluateConditions(target.conditions)) {
        if (!target.disableLogging) {
          this.log.always(strings.conditions.satisfied, target.name);
        }
        await target.trigger();
      } else {
        this.log.ifVerbose(strings.conditions.notSatisfied, target.name);
      }
    }
  }

  private evaluateConditions(conditions: ConditionsConfig): boolean {

    let result: boolean | undefined;

    for (const operand of conditions.operands) {

      const currentState = this.triggerStates.get(operand.accessoryId);
      if (!currentState) {
        this.log.ifVerbose(strings.conditions.stateUnknown, `'${operand.accessoryId}'`);
        result = false;
        break;
      }

      const operandResult = this.compareStates(currentState, operand.accessoryState);

      switch(conditions.operator) {
      case ConditionOperator.AND:
        result = result === undefined ? operandResult : result && operandResult;
        break;
      case ConditionOperator.OR:
        result = result === undefined ? operandResult : result || operandResult;
        break;
      }

      this.log.ifVerbose(strings.conditions.currentResult, `'${String(result)}'`);
    }

    return result ?? false;
  }

  private compareStates(current: AccessoryState, desired: AccessoryState): boolean {

    if (current === desired) {
      this.log.ifVerbose(strings.conditions.statesEqual, `'${current}'`);
      return true;
    }

    const stateType = getStateType(current);
    if (stateType && !Object.values(stateType).includes(desired)) {
      this.log.error(strings.conditions.statesUnrelated, `'${current}'`, `'${desired}'`);
      return false;
    }

    this.log.ifVerbose(strings.conditions.statesNotEqual, `'${current}'`, `'${desired}'`);
    return false;
  }
}