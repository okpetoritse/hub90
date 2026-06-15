import { Sticker, StickerPack } from '@/app/types/sticker'

export class StickerManager {
  static getStickerImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    return `/stickers/${imagePath}`
  }

  static formatStickerName(name: string): string {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  static groupStickersByPack(stickers: Sticker[]): Record<string, Sticker[]> {
    return stickers.reduce(
      (acc, sticker) => {
        if (!acc[sticker.pack_id]) {
          acc[sticker.pack_id] = []
        }
        acc[sticker.pack_id].push(sticker)
        return acc
      },
      {} as Record<string, Sticker[]>
    )
  }

  static filterFreeTierStickers(stickers: Sticker[]): Sticker[] {
    return stickers.filter((s) => s.id.includes('free'))
  }
}