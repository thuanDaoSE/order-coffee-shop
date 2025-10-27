import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast = ({ message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
      {message}
    </div>
  );
};

export default Toast;