import deepFreeze from 'deep-freeze-es6';

export default function(selector) {
  return {
    fromState: (state) => {
      let result;
      try {
        deepFreeze(state);
        result = selector(state);
      } catch (e) {
        if (e.message.includes('object is not extensible')) {
          throw 'State has been modified by Selector! This is a bug and should be fixed immediately!';
        }
      }

      return {
        shouldReturn: (expected) => {
          expect(result).toEqual(expected);
        },
        shouldReturnTrue: () => {
          expect(result).toBeTruthy();
        },
        shouldReturnFalse: () => {
          expect(result).toBeFalsy();
        }
      };
    }
  };
}
