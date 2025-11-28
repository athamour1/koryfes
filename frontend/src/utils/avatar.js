// Avatar generation utility using DiceBear API
export function getAvatarUrl(username) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
}
