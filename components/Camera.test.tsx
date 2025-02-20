jest.mock('expo-camera', () => ({
  CameraView: jest.fn().mockImplementation(({ children }) => <>{children}</>),
  useCameraPermissions: jest.fn(),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Camera, { TEST_ONLY } from './Camera';
import { CameraView, useCameraPermissions } from 'expo-camera';

const mockRequestPermission = jest.fn();
const {DisplayStrings} = TEST_ONLY;

describe('Camera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header text if permission is not granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: false }, mockRequestPermission ]);

    const { getByText } = render(<Camera headerText="Some header" onTakePhoto={jest.fn()} />);
    expect(getByText('Some header')).toBeTruthy();
  });

  it('renders header text if permission is granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);

    const { getByText } = render(<Camera headerText="Some header" onTakePhoto={jest.fn()} />);
    expect(getByText('Some header')).toBeTruthy();
  });

  it('renders permission request button if permission is not granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: false }, mockRequestPermission ]);

    const { getByText } = render(<Camera headerText="Some header" onTakePhoto={jest.fn()} />);
    expect(getByText(DisplayStrings.NEED_PERMISSION)).toBeTruthy();
    const button = getByText(DisplayStrings.GRANT_PERMISSION);
    fireEvent.press(button);
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('requests permission on "grant permission" button press', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: false }, mockRequestPermission ]);

    const { getByText } = render(<Camera headerText="Some header" onTakePhoto={jest.fn()} />);
    const button = getByText(DisplayStrings.GRANT_PERMISSION);
    fireEvent.press(button);
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('renders CameraView when permission is granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);

    const { getByText } = render(<Camera headerText="Some header" onTakePhoto={jest.fn()} />);
    expect(CameraView).toHaveBeenCalled();
    expect(getByText(DisplayStrings.TAKE_PHOTO)).toBeTruthy();
  });

  it('takes a photo when button is pressed', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);
    const mockTakePictureAsync = jest.fn().mockResolvedValue({ base64: 'base64string' });
    const mockCameraView = { takePictureAsync: mockTakePictureAsync };
    const onTakePhoto = jest.fn();
    
    jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: mockCameraView });

    const { getByText } = render(<Camera headerText="Some header" onTakePhoto={onTakePhoto} />);
    fireEvent.press(getByText(DisplayStrings.TAKE_PHOTO));

    await waitFor(() => {
      expect(onTakePhoto).toHaveBeenCalledWith('base64string');
    });
  });
});
