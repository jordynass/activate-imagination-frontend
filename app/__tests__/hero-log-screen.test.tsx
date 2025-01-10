import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HeroLogScreen, { ACTION_INPUT_PLACEHOLDER } from '../hero-log-screen'; // Adjust the path as needed
import useStream from '@/hooks/useStream';
import socket from '@/utils/network';

jest.mock('@/hooks/useStream');
jest.mock('@/utils/network', () => ({
  emit: jest.fn(),
}));

describe('HeroLogScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when stream is inactive', () => {
    (useStream as jest.Mock).mockReturnValue({ values: [], isActive: false });

    const { getByText, queryByText } = render(<HeroLogScreen />);

    expect(getByText('')).toBeTruthy();
    expect(queryByText('Take Action')).toBeNull();
  });

  it('renders content when stream has values', () => {
    (useStream as jest.Mock).mockReturnValue({ values: ['message1', 'message2'], isActive: false });

    const { getByText } = render(<HeroLogScreen />);

    expect(getByText('message1message2')).toBeTruthy();
  });

  it('renders input and button when stream is inactive and not waiting', () => {
    (useStream as jest.Mock).mockReturnValue({ values: ['message1'], isActive: false });

    const { getByText, getByPlaceholderText } = render(<HeroLogScreen />);
    expect(getByText('Take Action')).toBeTruthy();
    expect(getByPlaceholderText(ACTION_INPUT_PLACEHOLDER)).toBeTruthy();
  });

  it('emits action on button press', () => {
    (useStream as jest.Mock).mockReturnValue({ values: ['message1'], isActive: false });

    const { getByText, getByPlaceholderText } = render(<HeroLogScreen />);

    const input = getByPlaceholderText(ACTION_INPUT_PLACEHOLDER);
    fireEvent.changeText(input, 'test response');
    fireEvent.press(getByText('Take Action'));

    expect(socket.emit).toHaveBeenCalledWith('action', 'test response');
  });

  it('renders ActivityIndicator when isWaiting is true', async () => {
    (useStream as jest.Mock).mockReturnValue({ values: ['message1'], isActive: false });

    const { getByText, getByPlaceholderText, queryByTestId } = render(<HeroLogScreen />);

    const input = getByPlaceholderText(ACTION_INPUT_PLACEHOLDER);
    fireEvent.changeText(input, 'test response');
    fireEvent.press(getByText('Take Action'));

    await waitFor(() => {
      expect(queryByTestId('activity-indicator')).toBeTruthy();
    });
  });

  it('hides ActivityIndicator when stream resumes', async () => {
    (useStream as jest.Mock).mockReturnValue({ values: ['message1'], isActive: false });

    const { getByText, getByPlaceholderText, queryByTestId, rerender } = render(<HeroLogScreen />);

    const input = getByPlaceholderText(ACTION_INPUT_PLACEHOLDER);
    fireEvent.changeText(input, 'test response');
    fireEvent.press(getByText('Take Action'));

    await waitFor(() => {
      expect(queryByTestId('activity-indicator')).toBeTruthy();
    });

    (useStream as jest.Mock).mockReturnValue({ values: ['message2'], isActive: true });

    rerender(<HeroLogScreen />);
    
    await waitFor(() => {
      expect(queryByTestId('activity-indicator')).toBeFalsy();
    });
  });
});
