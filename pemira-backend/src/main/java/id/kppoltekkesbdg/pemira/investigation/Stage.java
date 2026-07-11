package id.kppoltekkesbdg.pemira.investigation;

/** 4 tahap investigasi di dalam status DIVERIFIKASI, berurutan. */
public enum Stage {
  VERIFIKASI,
  PENYELIDIKAN,
  PENYIDIKAN,
  GELAR_PERKARA;

  /** Tahap berikutnya, atau null bila sudah di tahap terakhir. */
  public Stage next() {
    Stage[] all = values();
    return ordinal() + 1 < all.length ? all[ordinal() + 1] : null;
  }

  public boolean isLast() {
    return this == GELAR_PERKARA;
  }
}
