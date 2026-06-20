import slugify from 'slugify';

export function toSlug(input = '') {
  return slugify(input, { lower: true, strict: true, locale: 'vi' });
}

// Ensure uniqueness: appends -1, -2, ... if existsFn(slug) resolves truthy.
export async function uniqueSlug(input, existsFn) {
  const base = toSlug(input) || 'item';
  let slug = base;
  let i = 1;
  while (await existsFn(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}
