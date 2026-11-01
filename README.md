# Claude全冠マスター (Claude Certified Grand Slam Master)

Anthropic公式認定資格（Claude Certified）全4種の完全制覇（全冠）を達成するための、**「完全教本（全32章）」＋「実践問題集（全240問・各試験60問）」＋「本番模擬試験（120分）」統合Webアプリケーション**です。

---

## 💡 本アプリの特徴

1. **CCDV-F（開発者向け基礎）最優先攻略特化モードを搭載！**
   - 最初の受験として最も推奨される **CCDV-F (Claude Certified Developer – Foundations)** に特化した専用学習メニューをサイドバー最上部に常設。
   - Messages API、ストリーミング(SSE)、Prompt Caching境界値、Tool Use、MCP、Claude Code、Batch APIの全8章を徹底解説。
   - 章ごとの「読了チェック機能」、試験直前チェックポイント、CCDV-F専用問題集（60問）および120分模試への直通導線を完備。

2. **全4資格の体系的カリキュラムを網羅（全32章の大ボリューム教本）**
   - **CCAO-F**（Claude Certified Associate – Foundations: 全7章）: ビジネス活用・プロンプト原則・ハルシネーション抑制・Few-shot・セキュリティ
   - **CCDV-F**（Claude Certified Developer – Foundations: 全8章）: Messages API、SSEストリーミング、Prompt Caching、Tool Use、MCP、Claude Code、セキュリティ、Batch API
   - **CCAR-F**（Claude Certified Architect – Foundations: 全9章）: **最難関**。Building Effective Agents 5大パターン、長文脈設計、Contextual Retrieval、Extended Thinking、トレードオフ、耐障害性
   - **CCAR-P**（Claude Certified Architect – Professional: 全8章）: エンタープライズ設計、AWS Bedrock/Vertex統合、ZDR、RSP/ASL、LLM-as-a-Judge 3大バイアス排除、CoE

3. **全冠達成者の知見とリアルな攻略ノウハウを完全反映**
   - みのるん氏（Qiita: `目指せClaude全冠！4つの試験を全部受けたので攻略法を紹介します`）
   - kyohei.DoAI氏（Zenn: `Claude公式認定資格4種をコンプリートした（2026年8月時点）ので、資格別難易度や勉強方法をまとめた`）
   - なぜCCAR-Fが基礎でありながら飛び抜けて難しいのか（みのるん氏も初受験で702点不合格）、推奨受験順序（CCDV-F → CCAO-F → CCAR-P → CCAR-F）、Pearson VUEのテストセンター受験の利点、英語原文切り替えのコツをすべて収録。
   - **みのるん氏のスコアレポート苦手分析から生まれた「CCAR-F重点リベンジ特訓18問」および「自分専用4択問題集ジェネレータープロンプト」を直接アプリに統合！**

4. **本番さながらのシミュレーション機能（各試験きっかり60問・計240問の圧倒的ボリューム）**
   - **実践問題集**: **全240問**（単一選択・複数選択シナリオ問題。全4試験各60問完全収録）。「🔥 みのるん式特訓（18問）」クイック絞り込みフィルター完備。公式根拠に基づいた詳細解説と「落とし穴（引っかけポイント）」を全問に収録。
   - **本番模擬試験**: 本番試験のボリューム（53〜63問）に完全準拠した60問・120分カウントダウンタイマー、見直しフラグ（Flag for Review）、1,000点換算スコア（720点合格判定）、合否バッジ。
   - **弱点集中特訓**: 間違えた問題のみを抽出して反復学習（正解すると自動解除）。
   - **必須チートシート**: APIパラメータ、Prompt Caching境界値、エージェントパターン比較、MCP仕様、ASLレベル早見表、HTTPエラーコード対策、定番引っかけ10選、および「みのるん式問題集ジェネレータープロンプト（ワンクリックコピー対応）」。

5. **ゼロ依存・オフライン完全対応**
   - 外部ライブラリ（React, Vue, jQuery等）や外部CDN（Tailwind, Google Fonts等）に一切依存していません。
   - インターネット接続が制限された環境でも、`index.html` をダブルクリックするだけで即座に起動します。
   - 学習履歴やブックマークはブラウザの `LocalStorage` に自動保存されます。

---

## 🚀 起動方法

### 方法1: ブラウザで直接開く（最も簡単）
フォルダ内の `index.html` をダブルクリック（または任意のブラウザにドラッグ＆ドロップ）するだけで起動します。

```bash
# パス:
C:\work\AI\Antigravity\ClaudeCertified\index.html
```

### 方法2: ローカルWebサーバーで開く
任意の静的ファイルサーバーを起動してアクセスすることも可能です。

```bash
# PowerShell / ターミナル
cd C:\work\AI\Antigravity\ClaudeCertified

# Python を使う場合
python -m http.server 8080

# または npx serve
npx serve .
```
ブラウザで `http://localhost:8080` を開きます。

---

## 📚 収録コンテンツ一覧

### 1. 全冠攻略ロードマップ (`roadmap`)
- 4資格の比較マトリクス（時間・問数・費用・合格点）
- 体感難易度の現実: `CCDV-F` ＜ `CCAO-F` ＜ `CCAR-P` ≪ `CCAR-F`
- 黄金の受験ルート設計
- Pearson VUE テストセンター受験攻略の心得

### 2. 全4資格 完全教科書 (`textbooks.js` - 全32章)
- **CCAO-F (7章)**: AI Fluency、XML構造化プロンプト、Chain of Thought、ハルシネーション対策、ユースケース、セキュリティ・プライバシー、プロンプト改善サイクル
- **CCDV-F (8章)**: Messages API完全仕様、SSEストリーミング、Prompt Caching（1,024/2,048トークン境界と5分TTL）、Tool Use往復フロー、MCPアーキテクチャ、Claude Code CLI、セキュリティ、Batch API & エラーコード
- **CCAR-F (9章 ★最難関)**: 「Building Effective Agents」5大パターン（Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer）、Needle In A Haystackとプロンプト末尾配置、Contextual Retrieval（文脈化検索）、長文脈vs RAGトレードオフ、Extended Thinking設計、多層ルーティング、耐障害性、無限ループ防止
- **CCAR-P (8章)**: AWS Bedrock vs GCP Vertex AI vs Direct API、HIPAA/SOC2/ZDR、Constitutional AI、Responsible Scaling Policy (ASL-1〜4)、LLM-as-a-Judge 3大バイアス（Position, Verbosity, Self-Enhancement）排除、Golden Test Set & CI/CD、FinOps、多層防御ガードレール、全社CoE

### 3. 実践問題集・本番模擬試験 (`questions.js` - 全240問・各試験60問)
- **CCAO-F**: 60問（プロンプト原則、XML構造化、ハルシネーション抑制、業務活用、Few-shot、安全管理）
- **CCDV-F**: 60問（Messages API、ストリーミング、Tool Use、MCP、Claude Code、Batch API、エラーハンドリング）
- **CCAR-F**: 60問（エージェント5大パターン、長文脈配置、Contextual Retrieval、みのるん式重点特訓18問含む最難関対策）
- **CCAR-P**: 60問（Bedrock/Vertex統合、ZDR契約、RSP/ASL、LLM-as-a-Judge 3大バイアス排除、CoE組織展開）
- **合計 240問**（全問に公式根拠解説＆引っかけポイント付き）

### 4. 必須チートシート (`cheatsheet.js`)
- Messages API パラメータ仕様一覧
- Prompt Caching スペック比較表
- Model Context Protocol (MCP) 3大プリミティブ
- エージェント5大パターントレードオフ表
- RSP / ASL 安全レベル定義表
- HTTPエラーコード早見表 & リカバリ戦略
- 合格者が教える「試験の定番引っかけ＆NGアンチパターン10選」
- **みのるん式・自分専用4択問題集ジェネレータープロンプト**（公式教材・PDFから4択問題を自動生成する魔法のプロンプト。ワンクリックコピー機能付き）

---

## 🏆 全冠達成に向けた学習ステップ

1. **ロードマップを確認する**: アプリの「全冠ロードマップ」を読み、試験の全体像と難易度差を把握。
2. **CCDV-Fからスタート**: 開発経験があれば最も合格しやすい「CCDV-F」の教科書を読み、問題集で満点を目指す。
3. **CCAO-Fで基礎固め**: プロンプトのXML構造化やハルシネーション防止の原則を盤石にする。
4. **CCAR-Pでエンタープライズ視点を獲得**: Bedrock統合やLLM-as-a-Judge評価の定石を習得。
5. **CCAR-Fに総力戦で挑む**: 「Building Effective Agents」のトレードオフ判断と長文脈設計を完璧に仕上げ、模擬試験で720点以上を安定して出せる状態にして本番へ！
