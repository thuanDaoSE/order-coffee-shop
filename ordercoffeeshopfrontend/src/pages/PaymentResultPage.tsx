import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, CircularProgress, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { getPaymentStatus } from '../services/paymentService';
import { useCart } from '../contexts/CartContext';

export default function PaymentResultPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending' | 'error'>('pending');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    const verifyAndPollPaymentStatus = async () => {
      setIsLoading(true);
      const params = new URLSearchParams(location.search);
      // vnp_TxnRef is the source of truth for our order ID
      const orderId = params.get('vnp_TxnRef'); 

      if (!orderId) {
        setError('Không tìm thấy mã đơn hàng trong kết quả trả về.');
        setPaymentStatus('error');
        setIsLoading(false);
        return;
      }
      
      // Always verify with our backend regardless of vnp_ResponseCode
      try {
        const result = await getPaymentStatus(orderId.toString());
        if (result.success && result.status === 'PAID') {
          setPaymentStatus('success');
          clearCart(); // <-- Xóa giỏ hàng ở đây
        } else {
          setPaymentStatus('failed');
          setError(result.message || 'Thanh toán không được xác nhận từ hệ thống. Vui lòng liên hệ hỗ trợ.');
        }
      } catch (err) {
        console.error('Error verifying payment status from backend:', err);
        setPaymentStatus('failed'); // Use 'failed' for consistency in UI
        setError('Đã xảy ra lỗi khi xác minh thanh toán');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndPollPaymentStatus();
  }, [location.search, navigate, clearCart]); // Thêm clearCart vào dependency array

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Đang xác nhận thanh toán...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {paymentStatus === 'success' ? (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom>
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được thanh toán thành công.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  const params = new URLSearchParams(location.search);
                  handleViewOrder(params.get('vnp_TxnRef') || '');
                }}
              >
                Xem đơn hàng
              </Button>
              <Button variant="outlined" onClick={handleBackToHome}>
                Về trang chủ
              </Button>
            </Box>
          </>
        ) : (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="error" gutterBottom>
              Thanh toán không thành công
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {error || 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.'}
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" color="primary" onClick={() => navigate('/cart')}>
                Quay lại giỏ hàng
              </Button>
              <Button variant="outlined" onClick={handleBackToHome}>
                Về trang chủ
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}