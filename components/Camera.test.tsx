const mockTakePictureAsync = jest.fn().mockResolvedValue({ base64: 'base64string' });
jest.mock('expo-camera', () => {
  const {useImperativeHandle, forwardRef} = require('react');
  return {
    CameraView: forwardRef(({children}: {children: ReactNode}, ref: MutableRefObject<unknown>) => {
      useImperativeHandle(ref, () => ({
        takePictureAsync: mockTakePictureAsync
      }));
      return <>{children}</>;
    }),
    useCameraPermissions: jest.fn(),
  };
});

import { MutableRefObject, ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Camera, { TEST_ONLY } from './Camera';
import { useCameraPermissions } from 'expo-camera';

const mockRequestPermission = jest.fn();
const {DisplayStrings} = TEST_ONLY;

describe('Camera', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header text if permission is not granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: false }, mockRequestPermission ]);

    const { getByText } = render(<Camera headerText="Some header" onRejectPhoto={jest.fn()} onTakePhoto={jest.fn()} />);
    expect(getByText('Some header')).toBeTruthy();
  });

  it('renders header text if permission is granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);

    const { getByText } = render(<Camera headerText="Some header" onRejectPhoto={jest.fn()} onTakePhoto={jest.fn()} />);
    expect(getByText('Some header')).toBeTruthy();
  });

  it('renders permission request button if permission is not granted', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: false }, mockRequestPermission ]);

    const { getByText } = render(<Camera headerText="Some header" onRejectPhoto={jest.fn()} onTakePhoto={jest.fn()} />);
    expect(getByText(DisplayStrings.NEED_PERMISSION)).toBeTruthy();
    const button = getByText(DisplayStrings.GRANT_PERMISSION);
    fireEvent.press(button);
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('requests permission on "grant permission" button press', () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: false }, mockRequestPermission ]);

    const { getByText } = render(<Camera headerText="Some header" onRejectPhoto={jest.fn()} onTakePhoto={jest.fn()} />);
    const button = getByText(DisplayStrings.GRANT_PERMISSION);
    fireEvent.press(button);
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('takes a photo when button is pressed', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);
    const onTakePhoto = jest.fn();
    
    const { getByText } = render(<Camera headerText="Some header" onRejectPhoto={jest.fn()} onTakePhoto={onTakePhoto} />);
    fireEvent.press(getByText(DisplayStrings.TAKE_PHOTO));

    await waitFor(() => {
      expect(onTakePhoto).toHaveBeenCalledWith('base64string');
    });
  });

  it('displays the captured photo after taking a picture', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);
    
    const { getByText, getByRole } = render(
      <Camera headerText="Some header" onRejectPhoto={jest.fn()} onTakePhoto={jest.fn()} />
    );
    
    fireEvent.press(getByText(DisplayStrings.TAKE_PHOTO));
    
    await waitFor(() => {
      const image = getByRole('img');
      expect(image.props.source.uri).toBe('data:image/jpeg;base64,base64string');
    });
  });

  it('shows retake button after capturing a photo', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);
    
    const { getByText } = render(
      <Camera headerText="Some header" onRejectPhoto={jest.fn()} onTakePhoto={jest.fn()} />
    );
    
    fireEvent.press(getByText(DisplayStrings.TAKE_PHOTO));
    
    await waitFor(() => {
      expect(getByText(DisplayStrings.RETAKE_PHOTO)).toBeTruthy();
    });
  });

  it('calls onRejectPhoto and resets the view when retake button is pressed', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);
    const onRejectPhoto = jest.fn();
    
    const { getByText, getByRole } = render(
      <Camera headerText="Some header" onRejectPhoto={onRejectPhoto} onTakePhoto={jest.fn()} />
    );
    
    fireEvent.press(getByText(DisplayStrings.TAKE_PHOTO));
    
    await waitFor(() => {
      expect(getByText(DisplayStrings.RETAKE_PHOTO)).toBeTruthy();
    });
    
    fireEvent.press(getByText(DisplayStrings.RETAKE_PHOTO));
    
    expect(onRejectPhoto).toHaveBeenCalled();
    expect(() => getByRole('img')).toThrow();
    expect(getByText(DisplayStrings.TAKE_PHOTO)).toBeTruthy();
  });

  it('maintains correct button state transitions through the photo capture flow', async () => {
    (useCameraPermissions as jest.Mock).mockReturnValue([ { granted: true }, mockRequestPermission ]);
    
    const { getByText } = render(
      <Camera headerText="Some header" onRejectPhoto={jest.fn()} onTakePhoto={jest.fn()} />
    );

    expect(getByText(DisplayStrings.TAKE_PHOTO)).toBeTruthy();
    
    fireEvent.press(getByText(DisplayStrings.TAKE_PHOTO));
    await waitFor(() => {
      expect(getByText(DisplayStrings.RETAKE_PHOTO)).toBeTruthy();
    });
    
    fireEvent.press(getByText(DisplayStrings.RETAKE_PHOTO));
    expect(getByText(DisplayStrings.TAKE_PHOTO)).toBeTruthy();
  });
});