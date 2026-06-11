-- Function to manually verify a user's email in Supabase
-- Usage: SELECT manual_verify_user('user-email@example.com');

CREATE OR REPLACE FUNCTION manual_verify_user(user_email TEXT)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  email_confirmed_at TIMESTAMPTZ,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's email confirmation timestamp
  UPDATE auth.users
  SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
  WHERE 
    auth.users.email = user_email
    AND email_confirmed_at IS NULL;
  
  -- Return the updated user info
  RETURN QUERY
  SELECT 
    id,
    auth.users.email,
    auth.users.email_confirmed_at,
    CASE 
      WHEN auth.users.email_confirmed_at IS NOT NULL THEN 'Verified'
      ELSE 'Not Found or Already Verified'
    END as status
  FROM auth.users
  WHERE auth.users.email = user_email;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION manual_verify_user(TEXT) TO postgres, service_role;

-- Example usage:
-- SELECT * FROM manual_verify_user('kenpatrickag21@gmail.com');
