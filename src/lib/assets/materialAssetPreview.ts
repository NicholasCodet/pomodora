import { getMaterialAsset } from './materialAssets';
import apatiteVisual from './materials/apatite.png';
import calciteVisual from './materials/calcite.png';
import corundumVisual from './materials/corundum.png';
import diamondVisual from './materials/diamond.png';
import fluoriteVisual from './materials/fluorite.png';
import geodeVisual from './materials/geode.avif';
import gypseVisual from './materials/gypse.png';
import orthoclaseVisual from './materials/orthoclase.png';
import quartzVisual from './materials/quartz.png';
import sunstoneVisual from './materials/sunstone.png';
import talcVisual from './materials/talc.png';
import topazeVisual from './materials/topaze.png';

export type MaterialAssetPreviewStatus = 'active' | 'future';

export interface MaterialAssetPreviewEntry {
  id: string;
  label: string;
  image: string;
  status: MaterialAssetPreviewStatus;
  note?: string;
}

const ACTIVE_ASSET_NOTE = 'Currently wired through materialAssets.ts and available in gameplay.';
const FUTURE_ASSET_NOTE = 'Future visual candidate only. Not present in the domain model yet.';

export const MATERIAL_ASSET_PREVIEW_ENTRIES: readonly MaterialAssetPreviewEntry[] = [
  {
    id: 'clay',
    label: 'Clay',
    image: getMaterialAsset('clay').illustration ?? getMaterialAsset('clay').thumbnail ?? '',
    status: 'active',
    note: ACTIVE_ASSET_NOTE,
  },
  {
    id: 'limestone',
    label: 'Limestone',
    image: getMaterialAsset('limestone').illustration ?? getMaterialAsset('limestone').thumbnail ?? '',
    status: 'active',
    note: ACTIVE_ASSET_NOTE,
  },
  {
    id: 'marble',
    label: 'Marble',
    image: getMaterialAsset('marble').illustration ?? getMaterialAsset('marble').thumbnail ?? '',
    status: 'active',
    note: ACTIVE_ASSET_NOTE,
  },
  {
    id: 'apatite',
    label: 'Apatite',
    image: apatiteVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'calcite',
    label: 'Calcite',
    image: calciteVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'corundum',
    label: 'Corundum',
    image: corundumVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'diamond',
    label: 'Diamond',
    image: diamondVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'fluorite',
    label: 'Fluorite',
    image: fluoriteVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'geode',
    label: 'Geode',
    image: geodeVisual,
    status: 'future',
    note: 'Uses geode.avif for preview; geode.png remains an unused alternate export.',
  },
  {
    id: 'gypse',
    label: 'Gypse',
    image: gypseVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'orthoclase',
    label: 'Orthoclase',
    image: orthoclaseVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'quartz',
    label: 'Quartz',
    image: quartzVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'sunstone',
    label: 'Sunstone',
    image: sunstoneVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'talc',
    label: 'Talc',
    image: talcVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'topaze',
    label: 'Topaze',
    image: topazeVisual,
    status: 'future',
    note: FUTURE_ASSET_NOTE,
  },
];
