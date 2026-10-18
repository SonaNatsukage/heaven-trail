# 素材記録

## 世界観

ユーザーが作成した「徳ポイントで転生を管理する、無機質な天国」。
https://zeta-ai.io/ja/plots/dcece1d2-09fb-4188-b3e3-258880293375/profile

ゲームの会話・選択肢は、この世界観をもとに今回作成した第0話用シナリオです。

## 画像

かみさまの画像はユーザーが使用を許可した `C:\Users\warui\Dropbox\picture\AI` からコピーしました。原本は変更していません。人物の割り当ては設定と画像の見た目に基づきます。

| ゲームのファイル | 元ファイル | 配役 |
| --- | --- | --- |
| public/images/adv/god.png | normal.png | かみさま |
| public/images/adv/yu.png | d9bcb25c-a2b8-43f3-975d-ede2dee5db5a.png | ゆう |
| public/images/adv/mahiru.png | f20c75c3-cf13-49ec-98ff-eb787d98b0e6.png | まひる |
| public/images/adv/yoru.png | 6e9b737a-e13b-4b22-abf1-3d472287c8ee.png | よる |
| public/images/adv/yume.png | b1d7b6fd-50d3-4a6c-a5a3-4d3659fdcc98.png | ゆめ |

## 音楽・効果音

このゲームのために作成したオリジナルの合成音源。既存曲・外部サンプル・外部音源サービスは使用していません。

- reception.wav — 白い窓口。32秒、ステレオ、ループ。
- cafe.wav — カップの向こう。32秒、ステレオ、ループ。
- quiet.wav — 忘れる前に。32秒、ステレオ、ループ。

生成元: scripts/generate-audio.mjs。音符・和音を組み、倍音とエンベロープ、短いディレイで音色を生成。
効果音は src/sound.js でWeb Audioを使って生成（決定、加点、減点、ベル、紙、受付印、カップ）。
外部音源のライセンス契約や帰属表示はありません。ユーザーはこのプロジェクトの音源と生成コードを編集・再生成できます。

## 立ち絵の更新（2026-10-18）

ゆうv1・まひるv1・よるv1・ゆめv4を内蔵画像生成ツールで制作し、public/images/adv の各人物PNGへ反映。上表は初期素材の記録。かみさまは初期素材を維持。人物設定と参照元は CHARACTER_DESIGN.md、生成指示は docs/art を参照。


## ゆうの座り絵（レビュー反映）

public/images/adv/yu-seated.png に、ユーザー提供の d9bcb25c-a2b8-43f3-975d-ede2dee5db5a.png を再採用。足の不自由さに合わせて会話中も座位とする。生成した立位の yu.png は比較用に保持し、現行ゲームからは参照しない。
`public/images/adv/yu-seated-v2.png`: 元のゆうの座り絵を image_gen で透過・右端補完。生成指示は docs/art/yu-seated-v2-prompt.txt。元画像と旧立ち絵は保存。

`public/audio/trial/*.wav`: Gemini TTSによるAI生成キャラクターボイス。ゆう=Achernar、まひる=Sulafat、ゆめ=Kore。台詞は `src/trial-data.js`、声の設計は `docs/voice-audition.json`、生成処理は `scripts/generate-trial-voices.mjs`、生成済みのモデル名・声名・ハッシュは同フォルダーの `manifest.json`。現時点で2/23本、残りは無料枠回復待ち。ゲーム内音声設定にAI生成の表記あり。
