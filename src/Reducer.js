import deepFreeze from 'deep-freeze-es6';
import mergeWith from 'lodash.mergewith';
import isArray from 'lodash.isarray';
import cloneDeep from 'lodash.clonedeep';

function toChangeInStateCustomizer(objValue, srcValue) {
  if (isArray(objValue)) {
    return srcValue;
  }
  return undefined;
}

export default function(reducer) {
  const defaultInitialState = reducer(undefined, {});

  function internalReducerCommands(initialState) {
    return {
      expect: (action) => {
        let newState;
        try {
          deepFreeze(initialState);
          newState = reducer(initialState, action);
        } catch (e) {
          if (e.message.includes('object is not extensible')) {
            throw 'State has been modified by Reducer! This is a bug and should be fixed immediately!';
          }
        }
        return {
          toReturnState: (expected) => {
            expect(newState).toEqual(expected);
          },
          toStayTheSame: () => {
            expect(newState).toEqual(initialState);
          },
          toChangeInState: (expectedChanges) => {
            const originalState = cloneDeep(initialState);
            const expected = mergeWith(originalState, expectedChanges, toChangeInStateCustomizer);
            expect(newState).toEqual(expected);
          }
        };
      },
      execute: (action) => {
        deepFreeze(initialState);
        return reducer(initialState, action);
      },
      initialState: (expected) => {
        expect(reducer()).toEqual(expected);
      }
    };
  }

  return {
    withState: (state) => {
      const initialState = state || defaultInitialState;
      return internalReducerCommands(initialState);
    },
    ...internalReducerCommands(defaultInitialState)
  };
}
