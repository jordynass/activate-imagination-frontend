import { renderHook, act } from '@testing-library/react';
import { useRealTimeState } from './useRealTimeState'; // Adjust the path as needed

describe('useRealTimeState', () => {
  it('should initialize with the given initial value', () => {
    const { result } = renderHook(() => useRealTimeState('initial'));

    const [field, , getFieldNow] = result.current;

    expect(field).toBe('initial');
    expect(getFieldNow()).toBe('initial');
  });

  it('should update the field and fieldRef correctly', () => {
    const { result } = renderHook(() => useRealTimeState('initial'));

    const [, setField, getFieldNow] = result.current;

    act(() => {
      setField('updated');
    });

    const [fieldAfterUpdate] = result.current;

    expect(fieldAfterUpdate).toBe('updated');
    expect(getFieldNow()).toBe('updated');
  });

  it('should maintain the correct field value in async callbacks', async () => {
    const { result } = renderHook(() => useRealTimeState('initial'));

    const [, setField, getFieldNow] = result.current;

    act(() => {
      setField('updated');
    });

    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate async delay

    expect(getFieldNow()).toBe('updated');
  });
});
