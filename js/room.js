// ISOLA - Room pairing logic

function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createRoom() {
    const sb = getSupabase();
    const userId = crypto.randomUUID();
    const inviteCode = generateInviteCode();

    const { data, error } = await sb
        .from('rooms')
        .insert({ invite_code: inviteCode, user1_id: userId })
        .select()
        .single();

    if (error) throw error;
    return { room: data, userId, inviteCode };
}

async function joinRoom(inviteCode) {
    const sb = getSupabase();
    const userId = crypto.randomUUID();

    // Find the room
    const { data: room, error: findErr } = await sb
        .from('rooms')
        .select()
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

    if (findErr || !room) throw new Error('Room not found');
    if (room.user2_id) throw new Error('Room is full');

    // Join it
    const { error: joinErr } = await sb
        .from('rooms')
        .update({ user2_id: userId })
        .eq('id', room.id);

    if (joinErr) throw joinErr;
    return { room: { ...room, user2_id: userId }, userId };
}

async function writeHeartbeat(roomId, userId, bpm) {
    const sb = getSupabase();
    const { error } = await sb
        .from('heartbeats')
        .insert({ room_id: roomId, user_id: userId, bpm });
    if (error) console.warn('heartbeat write failed:', error.message);
}

function subscribeToHeartbeats(roomId, myUserId, onPartnerBpm) {
    const sb = getSupabase();
    return sb
        .channel(`room-${roomId}`)
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'heartbeats', filter: `room_id=eq.${roomId}` },
            (payload) => {
                if (payload.new.user_id !== myUserId) {
                    onPartnerBpm(payload.new.bpm, payload.new.created_at);
                }
            }
        )
        .subscribe();
}

function subscribeToRoomJoin(roomId, onPartnerJoined) {
    const sb = getSupabase();
    return sb
        .channel(`room-join-${roomId}`)
        .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
            (payload) => {
                if (payload.new.user2_id) {
                    onPartnerJoined();
                }
            }
        )
        .subscribe();
}
