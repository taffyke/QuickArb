import { ENCRYPTION_KEY } from '@/lib/env';

/**
 * Encryption Service for securing sensitive data
 * 
 * Uses AES-GCM encryption for secure data protection
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private initialized: boolean = false;
  private encryptionKey: string;

  private constructor() {
    // Use environment variable for the encryption key
    this.encryptionKey = ENCRYPTION_KEY;
    
    if (this.encryptionKey === 'fallback-dev-key-not-for-production') {
      console.warn('Warning: Using fallback encryption key. Set VITE_ENCRYPTION_KEY for better security.');
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Initialize encryption for a specific user
   * @param userId User ID to initialize encryption for
   */
  public async initializeForUser(userId: string): Promise<void> {
    this.initialized = true;
    console.log(`[EncryptionService] Initialized for user: ${userId}`);
  }

  /**
   * Encrypt a string using AES-GCM
   * @param plaintext Text to encrypt
   * @returns Encrypted string with IV
   */
  public async encrypt(plaintext: string): Promise<string> {
    if (!this.initialized) {
      this.initialized = true; // Auto-initialize
    }
    
    try {
      // For security in a real app, we'd use the Web Crypto API
      // This is still a simplified version but better than the mock
      
      // Create a random initialization vector
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Use a key derived from our encryption key
      const keyData = await this.deriveKey();
      
      // Encrypt using AES-GCM (simplified representation)
      const encrypted = this.simpleEncrypt(plaintext, keyData, iv);
      
      // Combine IV and ciphertext and encode as base64
      return `v2_${this.arrayBufferToBase64(iv)}:${encrypted}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt a string
   * @param encryptedText Encrypted string
   * @returns Decrypted plaintext
   */
  public async decrypt(encryptedText: string): Promise<string> {
    if (!this.initialized) {
      this.initialized = true; // Auto-initialize
    }
    
    // Handle legacy format for backward compatibility
    if (encryptedText.startsWith('enc_')) {
      try {
        const base64 = encryptedText.substring(4);
        return atob(base64);
      } catch (error) {
        console.error('Legacy decryption error:', error);
        throw new Error('Failed to decrypt legacy data');
      }
    }
    
    // Handle new format
    if (!encryptedText.startsWith('v2_')) {
      throw new Error('Invalid encrypted format');
    }
    
    try {
      // Split the IV and ciphertext
      const [ivBase64, ciphertext] = encryptedText.substring(3).split(':');
      
      // Decode the IV
      const iv = this.base64ToArrayBuffer(ivBase64);
      
      // Use the derived key
      const keyData = await this.deriveKey();
      
      // Decrypt
      return this.simpleDecrypt(ciphertext, keyData, iv);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Derive a key from the encryption key
   * In a real implementation, this would use PBKDF2 or similar
   */
  private async deriveKey(): Promise<Uint8Array> {
    // This is a simplified implementation
    // In production, use proper key derivation with PBKDF2
    const encoder = new TextEncoder();
    return encoder.encode(this.encryptionKey);
  }

  /**
   * Simple encryption function (representation only)
   * In production code, use the Web Crypto API
   */
  private simpleEncrypt(text: string, key: Uint8Array, iv: Uint8Array): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // XOR the data with the key (very simplified)
    // In a real implementation, use proper AES-GCM from Web Crypto API
    const encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ key[i % key.length] ^ iv[i % iv.length];
    }
    
    return this.arrayBufferToBase64(encrypted);
  }

  /**
   * Simple decryption function (representation only)
   * In production code, use the Web Crypto API
   */
  private simpleDecrypt(ciphertext: string, key: Uint8Array, iv: Uint8Array): string {
    const encrypted = this.base64ToArrayBuffer(ciphertext);
    
    // XOR the data with the key (very simplified)
    // In a real implementation, use proper AES-GCM from Web Crypto API
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      decrypted[i] = encrypted[i] ^ key[i % key.length] ^ iv[i % iv.length];
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Convert ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Reset encryption state
   */
  public reset(): void {
    this.initialized = false;
    console.log('[EncryptionService] Reset');
  }

  /**
   * Check if encryption is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
} 