export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

export interface SignedUrlOptions {
  expiresIn?: number; // Expiration time in seconds
  contentType?: string;
}