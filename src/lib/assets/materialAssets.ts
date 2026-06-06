import type { MaterialType } from '../../core/models';
import clayVisual from './materials/clay.avif';
import limestoneVisual from './materials/limestone.avif';
import marbleVisual from './materials/marble.avif';

export interface MaterialAssetEntry {
  thumbnail: string | null;
  illustration: string | null;
  model3d: string | null;
}

const MATERIAL_ASSETS: Readonly<Record<MaterialType, MaterialAssetEntry>> = {
  clay: {
    thumbnail: clayVisual,
    illustration: clayVisual,
    model3d: null,
  },
  limestone: {
    thumbnail: limestoneVisual,
    illustration: limestoneVisual,
    model3d: null,
  },
  marble: {
    thumbnail: marbleVisual,
    illustration: marbleVisual,
    model3d: null,
  },
};

export function getMaterialAsset(materialType: MaterialType): MaterialAssetEntry {
  return MATERIAL_ASSETS[materialType];
}
