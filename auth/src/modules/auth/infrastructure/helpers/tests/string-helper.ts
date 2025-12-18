export const addPrefix = (chars: string, type: 'default' | 'new' | 'old') => {
  if (type == 'new') return chars.replace('senha', 'nova senha');
  if (type == 'old') return chars.replace('senha', 'senha antiga');
  return chars;
};
