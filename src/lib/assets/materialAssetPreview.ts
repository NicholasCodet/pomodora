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
export type MaterialAssetPreviewRole = 'playable' | 'future-candidate';
export type MaterialAssetQaStatus = 'ready' | 'review' | 'placeholder';
export type MaterialAssetFormat = 'avif' | 'png' | 'webp';

export interface MaterialAssetPreviewEntry {
  id: string;
  label: string;
  image: string;
  status: MaterialAssetPreviewStatus;
  fileName: string;
  format: MaterialAssetFormat;
  role: MaterialAssetPreviewRole;
  qaStatus: MaterialAssetQaStatus;
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
    fileName: 'clay.avif',
    format: 'avif',
    role: 'playable',
    qaStatus: 'ready',
    note: ACTIVE_ASSET_NOTE,
  },
  {
    id: 'limestone',
    label: 'Limestone',
    image: getMaterialAsset('limestone').illustration ?? getMaterialAsset('limestone').thumbnail ?? '',
    status: 'active',
    fileName: 'limestone.avif',
    format: 'avif',
    role: 'playable',
    qaStatus: 'ready',
    note: ACTIVE_ASSET_NOTE,
  },
  {
    id: 'marble',
    label: 'Marble',
    image: getMaterialAsset('marble').illustration ?? getMaterialAsset('marble').thumbnail ?? '',
    status: 'active',
    fileName: 'marble.avif',
    format: 'avif',
    role: 'playable',
    qaStatus: 'ready',
    note: ACTIVE_ASSET_NOTE,
  },
  {
    id: 'apatite',
    label: 'Apatite',
    image: apatiteVisual,
    status: 'future',
    fileName: 'apatite.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'calcite',
    label: 'Calcite',
    image: calciteVisual,
    status: 'future',
    fileName: 'calcite.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'corundum',
    label: 'Corundum',
    image: corundumVisual,
    status: 'future',
    fileName: 'corundum.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'diamond',
    label: 'Diamond',
    image: diamondVisual,
    status: 'future',
    fileName: 'diamond.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'fluorite',
    label: 'Fluorite',
    image: fluoriteVisual,
    status: 'future',
    fileName: 'fluorite.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'geode',
    label: 'Geode',
    image: geodeVisual,
    status: 'future',
    fileName: 'geode.avif',
    format: 'avif',
    role: 'future-candidate',
    qaStatus: 'review',
    note: 'Uses geode.avif for preview; geode.png remains an unused alternate export.',
  },
  {
    id: 'gypse',
    label: 'Gypse',
    image: gypseVisual,
    status: 'future',
    fileName: 'gypse.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'orthoclase',
    label: 'Orthoclase',
    image: orthoclaseVisual,
    status: 'future',
    fileName: 'orthoclase.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'quartz',
    label: 'Quartz',
    image: quartzVisual,
    status: 'future',
    fileName: 'quartz.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'sunstone',
    label: 'Sunstone',
    image: sunstoneVisual,
    status: 'future',
    fileName: 'sunstone.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'talc',
    label: 'Talc',
    image: talcVisual,
    status: 'future',
    fileName: 'talc.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
  {
    id: 'topaze',
    label: 'Topaze',
    image: topazeVisual,
    status: 'future',
    fileName: 'topaze.png',
    format: 'png',
    role: 'future-candidate',
    qaStatus: 'review',
    note: FUTURE_ASSET_NOTE,
  },
];
