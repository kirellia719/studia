import { create } from 'zustand';

import {
    DEFAULT_THEME,
    THEME_STORAGE_KEY,
    THEMES,
    getTheme,
} from '@/lib/themes.js';

const readStoredTheme = () => {
    try {
        const stored = localStorage.getItem(
            THEME_STORAGE_KEY
        );

        if (stored && THEMES.some((theme) => theme.id === stored)) {
            return stored;
        }
    } catch {
        // localStorage có thể bị chặn (chế độ riêng tư) — dùng theme mặc định.
    }

    return DEFAULT_THEME;
};

const paint = (id) => {
    const theme = getTheme(id);
    const root = document.documentElement;

    root.dataset.theme = theme.id;
    root.style.colorScheme = theme.dark ? 'dark' : 'light';
};

const initialTheme = readStoredTheme();
paint(initialTheme);

const useThemeStore = create((set) => ({
    theme: initialTheme,

    setTheme: (id) => {
        const theme = getTheme(id);

        paint(theme.id);

        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme.id);
        } catch {
            // Không lưu được thì vẫn giữ theme trong phiên hiện tại.
        }

        set({ theme: theme.id });
    },
}));

export default useThemeStore;
