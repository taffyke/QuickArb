-- Create API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange TEXT NOT NULL,
  label TEXT NOT NULL,
  api_key TEXT NOT NULL,
  secret TEXT NOT NULL,
  passphrase TEXT,
  permissions JSONB DEFAULT '{"read": true, "trade": false, "withdraw": false}'::jsonb,
  status TEXT DEFAULT 'pending',
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

-- Create function for PGCrypto encryption 
CREATE OR REPLACE FUNCTION encrypt_api_secret() 
RETURNS TRIGGER AS $$
BEGIN
  -- Only encrypt if not already encrypted
  IF (NEW.secret IS NOT NULL) THEN
    NEW.secret = pgp_sym_encrypt(
      NEW.secret,
      current_setting('app.settings.encryption_key')
    );
  END IF;
  
  IF (NEW.passphrase IS NOT NULL) THEN
    NEW.passphrase = pgp_sym_encrypt(
      NEW.passphrase,
      current_setting('app.settings.encryption_key')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically encrypt secrets before insert
CREATE TRIGGER encrypt_api_secrets_trigger
BEFORE INSERT ON api_keys
FOR EACH ROW
EXECUTE FUNCTION encrypt_api_secret();

-- Create an index on user_id for faster lookups
CREATE INDEX api_keys_user_id_idx ON api_keys(user_id);

-- Create index on exchange for filtering
CREATE INDEX api_keys_exchange_idx ON api_keys(exchange);

-- Grant usage to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT USAGE ON SEQUENCE api_keys_id_seq TO authenticated; 