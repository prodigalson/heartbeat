// ISOLA - Supabase client
const SUPABASE_URL = 'https://npryeakbhfwunkuxiouu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Vk1oLKYs-A1HO45PYjhHag_TtgWNrVF';

let _supabase = null;

function getSupabase() {
    if (!_supabase) {
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return _supabase;
}
