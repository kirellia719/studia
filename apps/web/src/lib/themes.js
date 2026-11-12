export const THEME_STORAGE_KEY = 'achan-theme';

export const DEFAULT_THEME = 'dat';

export const THEMES = [
  {
    id: 'dat',
    label: 'Hổ phách',
    hint: 'Vàng hổ phách, nền sáng trung tính',
    swatch: ['#E89A00', '#FFF3DC', '#F5F5F5'],
  },
  {
    id: 'bien',
    label: 'Biển xanh',
    hint: 'Xanh biển, sạch và rõ ràng',
    swatch: ['#2F5FD0', '#E9EFFC', '#F5F5F5'],
  },
  {
    id: 'dao',
    label: 'Đào',
    hint: 'Hồng đào, mềm và nổi bật',
    swatch: ['#C42A5C', '#FDE8EE', '#F5F5F5'],
  },
  {
    id: 'tim',
    label: 'Tím',
    hint: 'Tím dịu, đậm chất Achan',
    swatch: ['#6E48F0', '#EFEAFE', '#F5F5F5'],
  },
  {
    id: 'rung',
    label: 'Rừng xanh',
    hint: 'Xanh lá, tĩnh và dễ chịu',
    swatch: ['#1E8049', '#E6F4EB', '#F5F5F5'],
  },
  {
    id: 'toi',
    label: 'Nền tối',
    hint: 'Nền đen, chữ sáng, đỡ mỏi mắt',
    swatch: ['#F2A81C', '#121212', '#1C1C1C'],
    dark: true,
  },
];

export const getTheme = (id) =>
  THEMES.find((theme) => theme.id === id) ?? THEMES[0];
