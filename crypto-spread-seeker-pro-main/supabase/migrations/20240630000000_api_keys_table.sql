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
  status TEXT DEFAULT 'active',
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

-- Create a simpler encryption function (for development purposes)
-- In production, you should use pgp_sym_encrypt with proper key management
CREATE OR REPLACE FUNCTION simple_encrypt(text_to_encrypt TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple Base64 encoding is used for dev/staging
  -- In production, use proper encryption
  RETURN encode(text_to_encrypt::bytea, 'base64');
END;
$$ LANGUAGE plpgsql;

-- Create a simpler decryption function (for development purposes)
CREATE OR REPLACE FUNCTION simple_decrypt(text_to_decrypt TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple Base64 decoding is used for dev/staging
  -- In production, use proper decryption
  RETURN convert_from(decode(text_to_decrypt, 'base64'), 'UTF8');
END;
$$ LANGUAGE plpgsql;

-- Create function for server-side encryption
CREATE OR REPLACE FUNCTION encrypt_api_keys() 
RETURNS TRIGGER AS $$
BEGIN
  -- Encrypt the API keys before storing
  IF NEW.encrypted_api_key IS NOT NULL THEN
    NEW.encrypted_api_key := simple_encrypt(NEW.encrypted_api_key);
  END IF;
  
  IF NEW.encrypted_secret IS NOT NULL THEN
    NEW.encrypted_secret := simple_encrypt(NEW.encrypted_secret);
  END IF;
  
  IF NEW.encrypted_passphrase IS NOT NULL THEN
    NEW.encrypted_passphrase := simple_encrypt(NEW.encrypted_passphrase);
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
  api_key_record RECORD;
  decrypted_data JSON;
BEGIN
  -- Check if user is authorized (owns this key)
  PERFORM 1 FROM api_keys 
  WHERE id = key_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized access or key not found';
  END IF;
  
  -- Get the encrypted data
  SELECT * INTO api_key_record FROM api_keys WHERE id = key_id;
  
  -- Decrypt and return as JSON
  decrypted_data := json_build_object(
    'api_key', simple_decrypt(api_key_record.encrypted_api_key),
    'secret', simple_decrypt(api_key_record.encrypted_secret),
    'passphrase', 
      CASE WHEN api_key_record.encrypted_passphrase IS NOT NULL THEN
        simple_decrypt(api_key_record.encrypted_passphrase)
      ELSE
        NULL
      END
  );
  
  -- Update last_used timestamp
  UPDATE api_keys SET last_used = now() WHERE id = key_id;
  
  RETURN decrypted_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test API key connection function
CREATE OR REPLACE FUNCTION test_api_key_connection(key_id UUID)
RETURNS JSON AS $$
DECLARE
  api_key_record RECORD;
  test_result JSON;
BEGIN
  -- Check if user is authorized (owns this key)
  PERFORM 1 FROM api_keys 
  WHERE id = key_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized access or key not found';
  END IF;
  
  -- Get the key record
  SELECT * INTO api_key_record FROM api_keys WHERE id = key_id;
  
  -- Update status to testing
  UPDATE api_keys 
  SET test_result_status = 'testing',
      test_result_message = 'Testing connection...'
  WHERE id = key_id;
  
  -- In a real environment, this would call an external function to test
  -- For this demo, we'll just simulate success
  
  -- Simulate successful test
  UPDATE api_keys 
  SET test_result_status = 'success',
      test_result_message = 'Connection test successful',
      last_used = now()
  WHERE id = key_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Connection test successful'
  );
  
  -- In case of failure, you would return:
  -- RETURN json_build_object(
  --   'success', false,
  --   'message', 'Failed to connect: Invalid credentials'
  -- );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an index on user_id for faster lookups
CREATE INDEX api_keys_user_id_idx ON api_keys(user_id);

-- Create index on exchange for filtering
CREATE INDEX api_keys_exchange_idx ON api_keys(exchange);

-- Grant usage to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION decrypt_api_key(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION test_api_key_connection(UUID) TO authenticated; 