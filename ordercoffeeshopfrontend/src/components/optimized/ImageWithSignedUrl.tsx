import { memo } from 'react';

interface ImageWithSignedUrlProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
}

const ImageWithSignedUrl = memo(({ 
  src, 
  fallbackSrc = '/image.png',
  ...props 
}: ImageWithSignedUrlProps) => {
  const signedUrl = useSignedImageUrl(src);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    }
  };

  return (
    <img
      {...props}
      src={signedUrl || fallbackSrc}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  );
});

ImageWithSignedUrl.displayName = 'ImageWithSignedUrl';

export default ImageWithSignedUrl;
