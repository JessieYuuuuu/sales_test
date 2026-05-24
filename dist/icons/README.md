# App Icon Placeholder

這裡是手機「加入主畫面」圖示的預留位置。

目前 `index.html` 和 `manifest.webmanifest` 都指向：

```txt
public/icons/app-icon.svg
```

要換成正式圖片時，可以直接覆蓋這個檔案。

iPhone 的相容性通常以 PNG 最穩。如果你要改成 PNG，建議放：

```txt
public/icons/app-icon.png
```

然後同步把 `index.html` 與 `public/manifest.webmanifest` 裡的 `app-icon.svg` 改成 `app-icon.png`。
