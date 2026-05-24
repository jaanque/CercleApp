import { supabase } from '@/lib/supabase';
import { useCallback, useState } from 'react';

export function useStamps() {
    const [earnedStamps, setEarnedStamps] = useState<number | null>(null);
    const [totalStamps, setTotalStamps] = useState<number | null>(null);

    const loadUserStamps = useCallback(async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                setEarnedStamps(1);
                setTotalStamps(5);
                return;
            }
            const { data, error } = await supabase
                .from('user_stamps')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!error && data) {
                setEarnedStamps(data.earned_stamps);
                setTotalStamps(data.total_stamps);
            } else {
                setEarnedStamps(1);
                setTotalStamps(5);
            }
        } catch (err) {
            setEarnedStamps(1);
            setTotalStamps(5);
        }
    }, []);

    return { earnedStamps, totalStamps, loadUserStamps };
}