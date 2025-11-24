# Scout Badges - Frontend

The frontend application for Scout Badges, built with **Vue 3** and **Quasar Framework**.

## ✨ Key Features

### 🎨 Avatar Editor
A fully customizable avatar creator allowing users to personalize their scout identity.
-   **Customization:** Gender, skin tone, hair style/color, facial features, and accessories.
-   **Randomizer:** "Randomize Avatar" button for quick inspiration (preserves gender).
-   **Preview:** Real-time preview of the avatar.
-   **Credits:** Avatar assets and component logic adapted from **Bean Heads** (by [Robert Brogan](https://twitter.com/robertbrogan)).

### 🏆 Badge & Progress Tracking
-   **My Progress:** Visual tracking of earned badges, diplomas, and path completions.
-   **Badge Gallery:** View all available badges and their requirements.
-   **Profile:** Manage personal details and avatar.

### 🛡️ Admin Dashboard
-   **User Management:** Create, edit, and delete users. Assign roles (Leader, Scout).
-   **Unit Management:** Organize scouts into units/patrols.
-   **Badge Management:** Create and edit badges with custom images.
-   **Location Management:** Manage scout locations/groups.

### 🌍 Internationalization
-   Full support for **Greek (el)** and English.
-   Easy to extend with more languages via `vue-i18n`.

## 🛠️ Tech Stack

-   **Framework:** [Vue 3](https://vuejs.org/) (Composition API)
-   **UI Library:** [Quasar Framework](https://quasar.dev/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **State Management:** [Pinia](https://pinia.vuejs.org/)
-   **Routing:** [Vue Router](https://router.vuejs.org/)
-   **HTTP Client:** [Axios](https://axios-http.com/)
-   **I18n:** [Vue I18n](https://kazupon.github.io/vue-i18n/)

## 🚀 Local Development

1.  **Install dependencies**
    ```bash
    npm install
    ```

2.  **Start development server**
    ```bash
    npm run dev
    ```

3.  **Build for production**
    ```bash
    npm run build
    ```

## 📂 Project Structure

-   `src/components/`: Reusable UI components (Avatar, Badges, etc.)
-   `src/pages/`: Application views/pages
-   `src/layouts/`: Main layout templates
-   `src/stores/`: Pinia state stores (Auth, etc.)
-   `src/i18n/`: Translation files
-   `src/router/`: Route definitions
