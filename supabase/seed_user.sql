-- Add pgcrypto if not already there
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert a default instructor user in auth.users
-- Email: moniteur@copun.fr
-- Password: password123
-- This user is pre-confirmed.
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token_new, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'moniteur@copun.fr',
    crypt('password123', gen_salt('bf')),
    now(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Moniteur Demo"}',
    false,
    now(),
    now(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Ensure identity is linked (needed for login to work correctly in recent Supabase versions)
INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000001', 'moniteur@copun.fr')::jsonb,
    'email',
    now(),
    now(),
    now(),
    'moniteur@copun.fr'
) ON CONFLICT (id) DO NOTHING;
