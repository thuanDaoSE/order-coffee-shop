import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Container, Typography, Box, Alert, CircularProgress } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { getPaymentStatus, mockPaymentSuccess } from '../services/paymentService';
import { useCart } from '../contexts/CartContext';

export default function PaymentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const { orderId, totalAmount } = location.state || {};

  useEffect(() => {
    if (!orderId || !totalAmount) {
      navigate('/cart');
    }
  }, [orderId, totalAmount, navigate]);

  const handlePayment = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // MOCK PAYMENT FLOW
      await mockPaymentSuccess(orderId);
      
      // Manually navigate to result page with success params
      navigate(`/payment/vnpay/callback?vnp_ResponseCode=00&vnp_TxnRef=${orderId}`);
      clearCart(); // Clear cart after successful mock payment initiation
      
    } catch (err) {
      setError('Có lỗi xảy ra khi xử lý thanh toán giả lập. Vui lòng thử lại.');
      console.error('Mock payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!orderId || !totalAmount) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Thông tin thanh toán không hợp lệ</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <PaymentIcon color="primary" sx={{ fontSize: 60 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Thanh toán đơn hàng #{orderId}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePayment}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <PaymentIcon />}
          size="large"
        >
          {isLoading ? 'Đang xử lý...' : 'Thanh toán'}
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          Quay lại
        </Button>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Hướng dẫn thanh toán:
        </Typography>
        <ul>
          <li>Nhấn nút "Thanh toán qua VNPAY" để chuyển đến cổng thanh toán</li>
          <li>Thực hiện thanh toán theo hướng dẫn trên trang VNPAY</li>
          <li>Sau khi thanh toán thành công, bạn sẽ được chuyển về trang xác nhận</li>
          <li>Vui lòng không tắt trình duyệt cho đến khi hoàn tất thanh toán</li>
        </ul>
      </Box>
    </Container>
  );
}
