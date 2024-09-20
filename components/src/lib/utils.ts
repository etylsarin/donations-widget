export const camelize = (str: string) => str.replace(/-./g, x=>x[1].toUpperCase());

export const formatStringNumber = (n: string) => n.replace(/(?<!\.\d+)\B(?=(\d{3})+\b)/g, " ").replace(/(?<=\.(\d{3})+)\B/g, " ");

export const generateUniqueNum = () => +performance.now().toString().replace('.', '7');
