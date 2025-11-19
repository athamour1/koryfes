// Avatar generation utility using DiceBear API
export function getAvatarUrl(username, profileImage) {
    if (profileImage) {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${profileImage}`;
    }

    // Generate avatar using DiceBear API (initials style)
    const seed = encodeURIComponent(username || 'User');
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=4f46e5,7c3aed,db2777,dc2626,ea580c`;
}
