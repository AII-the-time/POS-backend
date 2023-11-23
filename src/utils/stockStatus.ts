export const STATUS = ['UNKNOWN', 'EMPTY', 'OUT_OF_STOCK', 'CAUTION', 'ENOUGH'] as const;
const enum STATUS_ENUM {
    UNKNOWN,
    EMPTY,
    OUT_OF_STOCK,
    CAUTION,
    ENOUGH,
}

export const getStockStatus = (
    currentAmount: number | null,
    noticeThreshold: number
  ) => {
    if (noticeThreshold < 0) return STATUS_ENUM.ENOUGH;
    if (currentAmount === null) return STATUS_ENUM.UNKNOWN;
    if (currentAmount < noticeThreshold * 0.1) return STATUS_ENUM.EMPTY;
    if (currentAmount < noticeThreshold * 0.3) return STATUS_ENUM.OUT_OF_STOCK;
    if (currentAmount < noticeThreshold) return STATUS_ENUM.CAUTION;
    return STATUS_ENUM.ENOUGH;
  }
