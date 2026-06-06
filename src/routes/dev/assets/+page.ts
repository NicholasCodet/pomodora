import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  if (!import.meta.env.DEV) {
    throw redirect(307, '/');
  }

  const { MATERIAL_ASSET_PREVIEW_ENTRIES } = await import('$lib/assets/materialAssetPreview');

  return {
    assets: MATERIAL_ASSET_PREVIEW_ENTRIES,
  };
};
