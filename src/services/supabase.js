import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getCherryBlossomSpots() {
  const { data, error } = await supabase
    .from('cherry_blossom_spots')
    .select('*')
    .not('latitude', 'is', null)
    .order('region')

  if (error) {
    console.error('Error fetching spots:', error)
    return []
  }

  return data
}
