export const formatVND = (price: number): string => {
  if (typeof price !== 'number') {
    return '0₫';
  }
  return `${price.toLocaleString('vi-VN')}₫`;
};
