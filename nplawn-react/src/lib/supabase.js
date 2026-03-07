import { createClient } from '@supabase/supabase-js';

// Obfuscated config — anon key is intentionally client-safe (enforced by Supabase RLS)
const _c = [
  'aHR0cHM6Ly9nYnhub2ZqcHJyanFxYnNlaXZoZS5zdXBhYmFzZS5jbw==',
  'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1kaWVHNXZabXB3Y25KcWNYRmljMlZwZG1obElpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTnpJNE9UUTBOVFVzSW1WNGNDSTZNakE0T0RRM01EUTFOWDAuR0w0cl9UMkpFY05yQ0JXeWw0SFdpdXpya2k3LUJlZUNjMy1PS2JNQ2JfQQ==',
];
const _d = (s) => atob(s);

export const supabase = createClient(_d(_c[0]), _d(_c[1]));
