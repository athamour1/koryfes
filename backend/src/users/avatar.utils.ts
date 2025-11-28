export const generateRandomAvatarConfig = () => {
    const options = {
        // New Avatar component prop names
        skin: ['light', 'yellow', 'brown', 'dark', 'red', 'black'],
        eye: ['normal-eyes', 'left-twitch', 'happy', 'content', 'squint', 'simple', 'dizzy', 'wink', 'heart'],
        eyebrows: ['none', 'raised', 'left-lowered', 'serious', 'angry', 'concerned'],
        mouth: ['grin', 'sad', 'open-smile', 'lips', 'open', 'serious', 'tongue', 'pirate-smile', 'smile'],
        hair: ['none', 'short', 'long', 'bun', 'pixie', 'balding', 'buzz', 'afro', 'bob'],
        clothing: ['none', 'naked', 'shirt', 'dress-shirt', 'v-neck', 'tank-top', 'dress'],
        accessory: ['none', 'round-glasses', 'tiny-glasses', 'shades'],
        hat: ['none', 'beanie', 'turban'],
        body: ['chest', 'breasts'],
        hairColor: ['white', 'blonde', 'orange', 'black', 'brown', 'blue', 'pink'],
        clothingColor: ['white', 'blue', 'black', 'green', 'red'],
        lipColor: ['red', 'purple', 'pink', 'turquoise', 'green'],
        hatColor: ['white', 'blue', 'black', 'green', 'red'],
        faceMask: [false],
        faceMaskColor: ['white', 'blue', 'black', 'green', 'red'],
        mask: [true],
        withLashes: [false, true],
        facialHair: ['none', 'stubble', 'medium-beard'],
        clothingGraphic: ['none', 'vue', 'react', 'gatsby', 'graphQL', 'redwood'],
        braStraps: [true, false]
    };

    const config: Record<string, any> = {};

    for (const [key, values] of Object.entries(options)) {
        const randomIndex = Math.floor(Math.random() * values.length);
        config[key] = values[randomIndex];
    }

    return config;
};
