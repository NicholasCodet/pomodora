import type { MaterialType } from '../../core/models';

export interface MaterialAssetEntry {
  thumbnail: string | null;
  illustration: string | null;
  model3d: string | null;
}

const MATERIAL_ASSETS: Readonly<Record<MaterialType, MaterialAssetEntry>> = {
  clay: {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
  limestone: {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
  marble: {
    thumbnail: null,
    illustration: null,
    model3d: null,
  },
};

export function getMaterialAsset(materialType: MaterialType): MaterialAssetEntry {
  return MATERIAL_ASSETS[materialType];
}
