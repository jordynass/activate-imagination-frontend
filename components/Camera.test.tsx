jest.mock('expo-camera', () => ({
  CameraView: jest.fn().mockImplementation(({ children }) => <>{children}</>),
  useCameraPermissions: jest.fn(),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Camera from './Camera'; // Adjust the path as needed
import { CameraView, useCameraPermissions } from 'expo-camera';

const mockRequestPermission = jest.fn();

describe('Camera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders permission request button if permission is not granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: false }, mockRequestPermission ]);

    const { getByText } = render(<Camera onTakePhoto={jest.fn()} />);
    expect(getByText('We need your permission to show the camera')).toBeTruthy();
    const button = getByText('grant permission');
    fireEvent.press(button);
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('requests permission on "grant permission" button press', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: false }, mockRequestPermission ]);

    const { getByText } = render(<Camera onTakePhoto={jest.fn()} />);
    const button = getByText('grant permission');
    fireEvent.press(button);
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('renders CameraView when permission is granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);

    const { getByText } = render(<Camera onTakePhoto={jest.fn()} />);
    expect(CameraView).toHaveBeenCalled();
    expect(getByText('Take Photo')).toBeTruthy();
  });

  it('takes a photo when button is pressed', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);
    const mockTakePictureAsync = jest.fn().mockResolvedValue({ base64: 'base64string' });
    const mockCameraView = { takePictureAsync: mockTakePictureAsync };
    const onTakePhoto = jest.fn();
    
    jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: mockCameraView });

    const { getByText } = render(<Camera onTakePhoto={onTakePhoto} />);
    fireEvent.press(getByText('Take Photo'));

    await waitFor(() => {
      expect(onTakePhoto).toHaveBeenCalledWith('base64string');
    });
  });
});
