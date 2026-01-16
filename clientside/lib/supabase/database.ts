import {createClient} from "./client";

export const getUserProfile = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_profile')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) console.error('Error fetching user profile:', error);
  return data;
};

export const updateUserProfile = async (userId: string, profileData: Record<string, unknown>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_profile')
    .upsert({ id: userId, ...profileData, updated_at: new Date() })
    .select()
    .single();

  if (error) console.error('Error updating user profile:', error);
  return data;
};

export const uploadUserAvatar = async (userId: string, file: File) => {
  const supabase = createClient();

  const fileName = `${userId}.png`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: '3600',
    });

  if (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }

  return fileName;
};

export const getUserAvatarUrl = (userId: string) => {
  const supabase = createClient();
  const timestamp = Date.now();

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(`${userId}.png`);

  const urlWithTimestamp = `${data.publicUrl}?t=${timestamp}`;
  console.log("Avatar URL with timestamp:", urlWithTimestamp);
  return urlWithTimestamp;
};

export const subscribeToUserProfile = (userId: string, callback: (profile: any) => void) => {
  const supabase = createClient();
  
  return supabase
    .channel(`user_profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profile',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
};

export const createUserProfile = async (userId: string, fullName: string, email: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_profile')
    .insert([
      {
        id: userId,
        full_name: fullName,
        email: email,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) console.error('Error creating user profile:', error);
  return data;
};
