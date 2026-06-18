function isAsciiWordChar(char: string): boolean {
  const code = char.codePointAt(0);

  if (code === undefined) {
    return false;
  }

  return (
    (code >= 48 && code <= 57) ||
    (code >= 97 && code <= 122) ||
    char === "_"
  );
}

export function slugify(value: string): string {
  let slug = "";
  let shouldAddSeparator = false;

  for (const char of value.toLowerCase().trim()) {
    if (isAsciiWordChar(char)) {
      if (shouldAddSeparator && slug.length > 0) {
        slug += "-";
      }

      slug += char;
      shouldAddSeparator = false;
      continue;
    }

    if (char === "-" || char.trim() === "") {
      if (slug.length > 0) {
        shouldAddSeparator = true;
      }
    }
  }

  return slug;
}