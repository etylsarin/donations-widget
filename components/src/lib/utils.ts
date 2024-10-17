export const camelize = (str: string) => str.replace(/-./g, x=>x[1].toUpperCase());

export const formatStringNumber = (n: string) => n.replace(/(?<!\.\d+)\B(?=(\d{3})+\b)/g, "&nbsp;").replace(/(?<=\.(\d{3})+)\B/g, "&nbsp;");

export const generateUniqueNum = () => (+performance.now() * 1000000000).toFixed().match(/.{1,15}/g)?.[0];
