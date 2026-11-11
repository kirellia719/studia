export const THEME_STORAGE_KEY = 'achan-theme';

export const DEFAULT_THEME = 'bien';

export const THEMES = [
  {
    id: 'bien',
    label: 'Biển xanh',
    hint: 'Nền sáng, xanh biển, điểm vàng',
    swatch: ['#1f6fb2', '#8a6110', '#eef3f8'],
  },
  {
    id: 'tim',
    label: 'Tím Achan',
    hint: 'Tím dịu như giao diện cũ',
    swatch: ['#5b4bd6', '#8a6a12', '#f5f3ff'],
  },
  {
    id: 'rung',
    label: 'Rừng xanh',
    hint: 'Xanh lá, tĩnh và dễ chịu',
    swatch: ['#17795e', '#8a6a12', '#eff5f1'],
  },
  {
    id: 'dat',
    label: 'Đất ấm',
    hint: 'Nâu đất, ấm và mềm',
    swatch: ['#a04d33', '#d6a83c', '#fbf4ed'],
  },
  {
    id: 'toi',
    label: 'Nền tối',
    hint: 'Nền đen, chữ sáng, đỡ mỏi mắt',
    swatch: ['#8b7bff', '#e3bb62', '#0d0e12'],
    dark: true,
  },
];

export const getTheme = (id) =>
  THEMES.find((theme) => theme.id === id) ?? THEMES[0];
