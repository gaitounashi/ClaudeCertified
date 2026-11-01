/**
 * Claude Certified チートシート & 早見表データ（超充実版）
 */
const CHEATSHEET_DATA = {
  apiParams: [
    { name: "model", type: "string", required: "必須", desc: "使用するモデル識別子（例: claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022）" },
    { name: "max_tokens", type: "integer", required: "必須", desc: "生成される応答の最大トークン長。Claude APIでは省略不可（必須）。" },
    { name: "messages", type: "array", required: "必須", desc: "会話配列。userとassistantが交互に並ぶ必要がある。systemロールはここには含めない。" },
    { name: "system", type: "string / array", required: "任意", desc: "トップレベルで渡すシステムプロンプト。配列にしてcache_controlを付与可能。" },
    { name: "temperature", type: "float", required: "任意", desc: "0.0〜1.0。0に近いほど決定論的（コード/抽出向け）、高いほど創造的。top_pと同時変更は避ける。" },
    { name: "top_p", type: "float", required: "任意", desc: "0.0〜1.0。核サンプリング。temperatureと同時にいじらないことが公式推奨。" },
    { name: "tool_choice", type: "object", required: "任意", desc: "{\"type\": \"auto\"}（自動）、{\"type\": \"any\"}（いずれかのツール強制）、{\"type\": \"tool\", \"name\": \"...\"}（特定ツール強制）。" },
    { name: "stream", type: "boolean", required: "任意", desc: "trueでServer-Sent Events（SSE）によるリアルタイムトークン受信。" },
    { name: "thinking.budget_tokens", type: "integer", required: "任意", desc: "Extended Thinkingで思考に費やす最大トークン数（最小1,024〜）。出力トークンとして課金。" }
  ],

  promptCaching: [
    { item: "最小キャッシュトークン", sonnetOpus: "1,024 トークン", haiku: "2,048 トークン", note: "境界値未満の場合はキャッシュされない（超重要）" },
    { item: "キャッシュ有効期限 (TTL)", sonnetOpus: "5分間", haiku: "5分間", note: "参照されるたびにTTLは自動で5分延長" },
    { item: "最大ブレークポイント数", sonnetOpus: "4箇所まで", haiku: "4箇所まで", note: "cache_control: {\"type\": \"ephemeral\"}" },
    { item: "キャッシュヒット時のコスト", sonnetOpus: "通常入力の10% (90%オフ)", haiku: "通常入力の10% (90%オフ)", note: "キャッシュ作成時は通常入力の125%" },
    { item: "レイテンシ削減率", sonnetOpus: "最大 85% 短縮", haiku: "最大 85% 短縮", note: "大規模コンテキストで劇的効果" },
    { item: "キャッシュキーの性質", sonnetOpus: "完全一致プレフィックス", haiku: "完全一致プレフィックス", note: "先頭に動的タイムスタンプを入れると100%ミスヒット" }
  ],

  agentPatterns: [
    {
      pattern: "Prompt Chaining（連鎖）",
      mechanism: "タスクを一連の固定直列ステップに分解し、出力を次の入力に渡す。",
      bestFor: "翻訳後の文体校正、文書ドラフト作成後のフォーマット整形。",
      tradeoff: "遅延がステップ数に比例。前の工程の誤りが後ろに波及。"
    },
    {
      pattern: "Routing（ルーティング）",
      mechanism: "入力を分類器で判定し、専門特化したプロンプトやモデルへ分岐。",
      bestFor: "カスタマーサポートの問合せ分類、Haikuで判定してSonnetへ振り分け。",
      tradeoff: "ルーター（分類器）の精度が全体のボトルネックになる。"
    },
    {
      pattern: "Parallelization (Sectioning)",
      mechanism: "大きなタスクを独立したサブタスクに分割して並列実行し最後に統合。",
      bestFor: "大規模コードベースの複数ファイル同時レビュー、長文文書の章別並列要約。",
      tradeoff: "APIレートリミット（RPM/TPM）を瞬間的に消費しやすい。"
    },
    {
      pattern: "Parallelization (Voting)",
      mechanism: "同一の判断を多様な視点・プロンプト・モデルで並列試行して合意形成。",
      bestFor: "コードのセキュリティ脆弱性判定、重大な法務リスクの多角検証。",
      tradeoff: "トークン消費が試行回数分倍増する。"
    },
    {
      pattern: "Orchestrator-Workers（司令塔）",
      mechanism: "中央のOrchestratorが動的に計画を立て、動的にWorkerを並行起動・集約。",
      bestFor: "未知のコードベース調査、タスク分割数が事前に決まらない複雑業務。",
      tradeoff: "トークン消費量とコストが高く、中央モデルの高い知能（Sonnet/Opus）が必須。"
    },
    {
      pattern: "Evaluator-Optimizer（評価ループ）",
      mechanism: "生成モデルが出力し、評価モデルが基準に沿ってレビュー・修正ループ。",
      bestFor: "厳格な制約条件を満たすコード生成、文芸・コピーライティングの推敲。",
      tradeoff: "収束条件（終了判定・最大反復数）が甘いと無限ループしてコストを浪費。"
    }
  ],

  mcpPrimitives: [
    { primitive: "Tools（ツール）", direction: "Model → Server", effect: "副作用あり（State-mutating）", desc: "クライアントの承認を受けて実行される関数（DB書込、外部API実行等）" },
    { primitive: "Resources（リソース）", direction: "Server → Client", effect: "読み取り専用（Read-only）", desc: "URIで識別される受動的データ（ファイル内容、DBスキーマ、ログ等）" },
    { primitive: "Prompts（プロンプト）", direction: "Server → Client", effect: "事前定義テンプレート", desc: "スラッシュコマンドや事前設定プロンプトテンプレートの提供" }
  ],

  aslLevels: [
    { level: "ASL-1", risk: "壊滅的リスクなし", definition: "標準的なLLM以前のシステムや単純な分類タスク。" },
    { level: "ASL-2", risk: "初歩的危険（現状の主要モデル）", definition: "危険な知識はあるが、通常のWeb検索で得られる情報を超えないレベル。" },
    { level: "ASL-3", risk: "生物兵器・自律サイバー攻撃リスク", definition: "重大なサイバー攻撃の自律実行や生物兵器製造の具体的危険支援が可能。二重暗号化・隔離環境運用が義務化。" },
    { level: "ASL-4", risk: "国家安全保障の重大脅威", definition: "未到達の極限レベル。完全な自律拡散や壊滅的脅威。厳格な国際規制対象。" }
  ],

  examComparison: [
    { code: "CCAO-F", target: "非開発・PM・ビジネス", questions: "60問 / 120分", fee: "$99", pass: "720 / 1000", diff: "★3", tip: "プロンプトXML化、グラウンディング、ハルシネーション対策、Few-shot" },
    { code: "CCDV-F", target: "エンジニア・API開発", questions: "53問 / 120分", fee: "$125", pass: "720 / 1000", diff: "★2 (最易)", tip: "Messages API仕様、Prompt Caching最小トークン、Tool Use、MCP、Claude Code" },
    { code: "CCAR-F", target: "ソリューション設計者", questions: "60問 / 120分", fee: "$125", pass: "720 / 1000", diff: "★5 (最難関)", tip: "Building Effective Agents、Contextual Retrieval、長文脈配置順序、トレードオフ" },
    { code: "CCAR-P", target: "上級アーキテクト・統括", questions: "63問 / 120分", fee: "$175", pass: "720 / 1000", diff: "★4", tip: "Bedrock/Vertex統合、ZDR、RSP/ASL、LLM-as-a-Judgeバイアス排除、CoE" }
  ],

  errorCodes: [
    { code: "400", type: "invalid_request_error", cause: "必須パラメータ（max_tokens等）欠落、JSON構文異常", action: "リクエスト構文を修正。自動リトライは無効。" },
    { code: "401", type: "authentication_error", cause: "APIキーが無効または未設定", action: "APIキーを再確認・再発行。" },
    { code: "403", type: "permission_error", cause: "アクセス権限がないモデルや機能の呼び出し", action: "アカウント権限やモデル利用申請状況を確認。" },
    { code: "404", type: "not_found_error", cause: "指定されたモデルIDやリソースが存在しない", action: "モデルIDのスペルミス（日付サフィックス等）を確認。" },
    { code: "429", type: "rate_limit_error", cause: "組織のRPM（分あたりリクエスト）またはTPM超過", action: "ジッター付き指数バックオフ（Exponential Backoff with Jitter）でリトライ。" },
    { code: "529", type: "overloaded_error", cause: "Anthropicサーバーの一時的過負荷", action: "一定時間待機後に指数バックオフでリトライ。" }
  ],

  trapList: [
    { title: "罠1: むやみに自律エージェントを作る", desc: "Anthropicの公式ベストプラクティスでは、決定論的なコードで制御できる「ワークフロー」を最優先すべきと明記されています。" },
    { title: "罠2: 長文プロンプトで指示を先頭に書く", desc: "巨大資料を投入する際は、資料を前に置き、指示と質問を「最も末尾」に置くのが公式の最高精度ルールです。" },
    { title: "罠3: キャッシュの先頭に動的日時を入れる", desc: "プレフィックスの1文字でも変わるとPrompt Cachingは無効になります。静的マニュアルを先頭に置きましょう。" },
    { title: "罠4: Haikuの最小キャッシュ長を1,024と覚える", desc: "Sonnet/Opusは1,024トークンですが、Haikuは2,048トークンです。試験で極めてよく出る引っかけです。" },
    { title: "罠5: ベクトル検索（Dense）だけで型番を検索する", desc: "型番やエラーコードの完全一致にはBM25（Sparse）が必要です。ハイブリッド検索＋Re-rankingを選びましょう。" },
    { title: "罠6: LLM-as-a-Judgeで1回だけ評価する", desc: "位置バイアス（Position Bias）があるため、必ずOption A/Bを入れ替えたSwap Evaluationで2回評価します。" },
    { title: "罠7: ZDR契約だから自社もログを捨ててしまう", desc: "ベンダー側が保存しないため、自社の説明責任を果たすための監査ログは自社KMS暗号化ストレージに保管必須です。" },
    { title: "罠8: 429エラーに即時連続リトライをかける", desc: "サンダリングハード問題を引き起こします。必ずランダムなJitterを加えた指数バックオフで待機します。" },
    { title: "罠9: max_tokensを省略する", desc: "Claude Messages APIではmax_tokensは必須パラメータです。省略すると400エラーになります。" },
    { title: "罠10: CCAR-Fを最初に受験する", desc: "全冠達成者が認める最難関です。CCDV-F（開発基礎）やCCAO-Fで土台を作ってから最後に挑みましょう。" }
  ],

  minorunPromptGenerator: {
    title: "みのるん式・自分専用4択問題集ジェネレータープロンプト",
    desc: "みのるん氏がQiita記事（目指せClaude全冠！）で実践した「公式教材をClaudeに食わせてスマホで隙間時間に解ける4択問題集を作らせる」プロンプトの完全版です。手元のPDFやWebドキュメントをClaudeに添付して実行してください。",
    prompt: `あなたはAnthropic公式認定資格（Claude Certified）の試験作成官です。
以下の提供資料（公式ドキュメント、論文、コーステキスト等）を精読した上で、本番試験のクオリティに匹敵する「実務シナリオ形式の4択問題」を5問作成してください。

# 問題作成の要件
1. 単なる用語の暗記ではなく、「実務のアーキテクチャ設計でのトレードオフ」「トラブルシューティング」「公式ベストプラクティスに基づく最適解の選択」を問う長文シナリオ問題にすること。
2. 選択肢はA〜Dの4択とし、もっともらしい誤答（引っかけのアンチパターン）を含めること。
3. 特に以下の出題観点を重点的に網羅すること：
   - ワークフロー vs 自律エージェントの選定境界
   - Prompt Cachingの配置と最小トークン要件（Sonnet 1024 / Haiku 2048）
   - 長文コンテキスト配置（資料は前、指示・質問は末尾）
   - Contextual RetrievalとBM25ハイブリッド検索（RRF）
   - レートリミット（429）への指数バックオフ＋Jitter
4. 各問題について、以下のフォーマットで出力すること：
   - 【設問】実務シナリオ問題文
   - 【選択肢】A, B, C, D
   - 【正解】正解のアルファベット
   - 【公式解説】なぜそれが正解か、なぜ他の選択肢が不適切かの詳細な解説
   - 【⚠️引っかけポイント】受験者が陥りやすい典型的な誤解の解説`
  }
};
