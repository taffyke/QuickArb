-- Create API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange TEXT NOT NULL,
  label TEXT NOT NULL,
  encrypted_api_key TEXT NOT NULL,
  encrypted_secret TEXT NOT NULL,
  encrypted_passphrase TEXT,
  permissions JSONB DEFAULT '{"read": true, "trade": false, "withdraw": false}'::jsonb,
  status TEXT DEFAULT 'pending',
  test_result_status TEXT DEFAULT 'pending',
  test_result_message TEXT,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Security policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
CREATE POLICY "Users can view their own API keys"
  ON api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own API keys
CREATE POLICY "Users can insert their own API keys"
  ON api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own API keys
CREATE POLICY "Users can update their own API keys"
  ON api_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own API keys
CREATE POLICY "Users can delete their own API keys"
  ON api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_keys_timestamp
BEFORE UPDATE ON api_keys
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create function for server-side encryption
CREATE OR REPLACE FUNCTION encrypt_api_keys() 
RETURNS TRIGGER AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Get the encryption key from app settings
  encryption_key := current_setting('app.settings.encryption_key', true);
  
  -- Fall back to a default key if not set (not recommended for production)
  IF encryption_key IS NULL THEN
    encryption_key := 'default-encryption-key-for-development-only';
  END IF;

  -- Encrypt the API keys before storing
  IF NEW.encrypted_api_key IS NOT NULL THEN
    NEW.encrypted_api_key := pgp_sym_encrypt(
      NEW.encrypted_api_key,
      encryption_key
    );
  END IF;
  
  IF NEW.encrypted_secret IS NOT NULL THEN
    NEW.encrypted_secret := pgp_sym_encrypt(
      NEW.encrypted_secret,
      encryption_key
    );
  END IF;
  
  IF NEW.encrypted_passphrase IS NOT NULL THEN
    NEW.encrypted_passphrase := pgp_sym_encrypt(
      NEW.encrypted_passphrase,
      encryption_key
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically encrypt secrets before insert
CREATE TRIGGER encrypt_api_keys_trigger
BEFORE INSERT OR UPDATE ON api_keys
FOR EACH ROW
EXECUTE FUNCTION encrypt_api_keys();

-- Create function for decryption (to be used via RPC only by authorized users)
CREATE OR REPLACE FUNCTION decrypt_api_key(key_id UUID)
RETURNS JSON AS $$
DECLARE
  encryption_key TEXT;
  api_key_record RECORD;
  decrypted_data JSON;
BEGIN
  -- Check if user is authorized (owns this key)
  PERFORM 1 FROM api_keys 
  WHERE id = key_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized access or key not found';
  END IF;
  
  -- Get the encryption key
  encryption_key := current_setting('app.settings.encryption_key', true);
  
  -- Fall back to a default key if not set (not recommended for production)
  IF encryption_key IS NULL THEN
    encryption_key := 'default-encryption-key-for-development-only';
  END IF;
  
  -- Get the encrypted data
  SELECT * INTO api_key_record FROM api_keys WHERE id = key_id;
  
  -- Decrypt and return as JSON
  decrypted_data := json_build_object(
    'api_key', pgp_sym_decrypt(api_key_record.encrypted_api_key::bytea, encryption_key),
    'secret', pgp_sym_decrypt(api_key_record.encrypted_secret::bytea, encryption_key),
    'passphrase', 
      CASE WHEN api_key_record.encrypted_passphrase IS NOT NULL THEN
        pgp_sym_decrypt(api_key_record.encrypted_passphrase::bytea, encryption_key)
      ELSE
        NULL
      END
  );
  
  -- Update last_used timestamp
  UPDATE api_keys SET last_used = now() WHERE id = key_id;
  
  RETURN decrypted_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an index on user_id for faster lookups
CREATE INDEX api_keys_user_id_idx ON api_keys(user_id);

-- Create index on exchange for filtering
CREATE INDEX api_keys_exchange_idx ON api_keys(exchange);

-- Grant usage to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT USAGE ON SEQUENCE api_keys_id_seq TO authenticated;

-- Grant execute on the decrypt function to authenticated users
GRANT EXECUTE ON FUNCTION decrypt_api_key(UUID) TO authenticated; 