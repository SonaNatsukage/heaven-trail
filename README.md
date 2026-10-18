# 来世が決まるまで、ここにいて。

ユーザーの「徳ポイントで転生を管理する、無機質な天国」をもとにした、React / Vite製のテキストADV。第0話「冷めないコーヒー」を収録。

## 起動

Windowsでは、このフォルダの `play.cmd` をダブルクリックするか、VSCodeのターミナルで以下を実行します。

```powershell
npm.cmd run dev -- --host localhost --port 5174 --strictPort
```

http://localhost:5174/ を開き、起動用ターミナルは閉じないでください。ポート使用中の場合は既存のサーバーを確認するか、別のポートを指定してください。初回に依存関係がない場合は `npm.cmd install` が必要です。

## 遊び方

- 「音ありで、物語を始める」でBGM・効果音を有効化します。
- 「次へ」またはSpace / Enterで文字送り。表示途中では全文を表示します。
- 5回の選択で徳が増減します。最後の選択で3種類の結末に分かれます。
- 会話履歴と手帳をメニューから確認できます。
- セーブは1スロット。ブラウザのlocalStorageに保存します。同じブラウザ・同じポートで再開してください。ブラウザのデータ消去でセーブも消えます。
- 設定からBGM・効果音を個別調整、ミュート、音声再開できます。音量設定も保存されます。
- 本編はここで転生せず、第0話の余韻で終わります。

## 編集と検証

- `src/story.js`: 台詞、選択肢、徳、結末、進行・保存の復元処理
- `src/App.jsx`: 会話UI、文字送り、手帳、セーブ、設定
- `src/sound.js`: BGM切替、効果音の合成
- `src/App.css`: 画面とレスポンシブ対応
- `scripts/generate-audio.mjs`: オリジナルBGMの生成。`node scripts/generate-audio.mjs` でWAVを再生成
- `scripts/test-story.mjs`: 全243通りの経路、各地点での保存・復元、不正データ、選択の重複処理を検証
- `src/trial.js`: 初期裁判試作のデータ。現在のADVでは未使用

```powershell
node scripts/test-story.mjs
npm.cmd run lint
npm.cmd run build
```

画像・音源については `ASSETS.md` を参照。
