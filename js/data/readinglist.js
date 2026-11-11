/**
 * CCAR-F 一次情報リーディングリスト
 * スコアレポートで100%未満だった試験目標 → 読むべき公式資料 → 要点 → 確認問題
 * 方針: 要点は公式資料に書かれていることだけ。試験目標の文言から導いた「答え筋」は明示的に区別する。
 * リンク切れの場合はタイトルで検索してください（docs のドメインは移転することがあります）。
 */
const READING_LIST_DATA = {
  updated: "2026-11-11",
  cards: [
    {
      id: "tool-use",
      title: "ツール呼び出しの基本（並列・tool_choice・抽出スキーマ）",
      objectives: [
        { text: "単一の応答ターン内で複数のツール呼び出しを発行し、ラウンドトリップを削減する", score: 0 },
        { text: "tool_choice を構成して、ツール呼び出し（構造化出力）を保証する", score: 50 },
        { text: "欠落・曖昧な情報を捏造せず表現できる抽出スキーマ（optional・null・enum）", score: 67 }
      ],
      sources: [
        { title: "Claude API Docs: Tool use — How to implement tool use", url: "https://docs.claude.com/en/docs/agents-and-tools/tool-use/implement-tool-use", focus: "「Forcing tool use（tool_choice）」「Parallel tool use」「Handling tool results」の節" },
        { title: "Claude API Docs: Structured outputs", url: "https://docs.claude.com/en/docs/build-with-claude/structured-outputs", focus: "strict tool use（入力がスキーマに厳密に一致することの保証）" },
        { title: "Anthropic Engineering: Writing effective tools for agents", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", focus: "ツール説明の書き方、返す情報の絞り方" }
      ],
      keyPoints: [
        "Claude は1回の応答で複数の tool_use ブロックを返せる。結果は、次の1つの user メッセージにすべての tool_result をまとめて返す（tool_result を複数メッセージに分けない）。",
        "tool_choice は auto（既定・呼ぶかどうかはモデル判断）/ any（どれか1つ以上必ず呼ぶ）/ tool（指定ツールを必ず呼ぶ）/ none（呼ばない）の4種。",
        "disable_parallel_tool_use: true にすると、auto では最大1つ、any / tool ではちょうど1つのツールしか呼ばなくなる。",
        "any / tool で強制すると、Claude はツール呼び出しの前に説明文を出さない。また Extended Thinking と併用できるのは auto と none だけ。",
        "【試験目標からの答え筋】原文にないかもしれない項目を required・非nullにすると、モデルは値を埋めようとして捏造しやすい → null 許容・optional、enum に \"unclear\" / \"not_mentioned\" などの逃げ道を用意。"
      ],
      checks: [
        { q: "独立した3つのツールを Claude が1回の応答で同時に呼んだ。結果はどう返す？", a: "3つの tool_result ブロックを、次の1つの user メッセージの content にまとめて返す。" },
        { q: "下流システムが必ず JSON を必要とし、使うツールは1つだけ。tool_choice はどう設定する？ さらにスキーマへの厳密な一致まで保証したい場合は？", a: "{\"type\":\"tool\",\"name\":\"<ツール名>\"} で呼び出しを強制。厳密な一致まで必要ならツール定義に strict: true（Structured outputs）を併用。" },
        { q: "tool_choice の any と tool の違いは？", a: "any は「用意したツールのどれか」を必ず呼ぶ（どれにするかはモデルが選ぶ）。tool は「指定した特定のツール」を必ず呼ぶ。" }
      ]
    },
    {
      id: "patterns",
      title: "エージェントパターンとレビュー方式の選び方",
      objectives: [
        { text: "マルチエージェント・オーケストレーションパターンの選択", score: 0 },
        { text: "反復的改善ワークフロー（具体例・的を絞ったフィードバック）", score: 0 },
        { text: "レビューアーキテクチャの選択（いきなり実装するか、計画を挟むか）", score: 0 }
      ],
      sources: [
        { title: "Anthropic Engineering: Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents", focus: "「Workflow: ...」の5節と「Agents」「When (and when not) to use agents」" },
        { title: "Anthropic Engineering: How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", focus: "マルチエージェントが向く／向かないタスク、トークンコスト" },
        { title: "Anthropic Engineering: Claude Code best practices", url: "https://www.anthropic.com/engineering/claude-code-best-practices", focus: "「Explore, plan, code, commit」ワークフロー" },
        { title: "Claude Code Docs: Common workflows（Plan Mode）", url: "https://code.claude.com/docs/en/common-workflows", focus: "Plan Mode（読み取り専用で分析・計画）の使いどころ" }
      ],
      keyPoints: [
        "記事は「ワークフロー（事前に定義したコード経路）」と「エージェント（LLMが手順を動的に決める）」を区別する。Prompt chaining / Routing / Parallelization / Orchestrator-workers / Evaluator-optimizer の5つはすべてワークフロー側。",
        "Parallelization と Orchestrator-workers の違いは「分割が事前に決まっているか」。サブタスクが入力次第で決まるなら Orchestrator-workers。",
        "Evaluator-optimizer が向くのは、明確な評価基準があり、反復的な改善で価値が出る場合。",
        "マルチエージェントは単一エージェントよりトークン消費が大きく（記事ではチャットの約15倍）、並列化しやすい幅広い調査に向く。全員が同じコンテキストを共有する必要がある・依存関係が多いタスク（多くのコーディングなど）には向きにくい。",
        "Claude Code best practices では、いきなりコードを書かせず「調べる → 計画を立てる → 実装 → コミット」の順を勧めている。Plan Mode はこの「調べて計画する」段階を読み取り専用で行う機能。",
        "【試験目標からの答え筋】反復改善のフィードバックは「具体的な入出力例」「特定の失敗への的を絞った指摘」「複数の問題をまとめた説明」の3点セット。"
      ],
      checks: [
        { q: "4つの独立した観点（セキュリティ・性能・互換性・A11y）でPRを低レイテンシにレビューしたい。どのパターン？", a: "Parallelization（Sectioning）。観点ごとに分けて同時に実行し、最後に統合する。" },
        { q: "障害調査で、どの領域を調べるべきかが初期調査の結果次第で変わる。どのパターン？", a: "Orchestrator-workers。中央のLLMが動的にタスクを分解・委任する。" },
        { q: "Orchestrator-workers は『ワークフロー』と『エージェント』のどちらに分類されている？", a: "ワークフロー（Building effective agents の分類）。" },
        { q: "複数ファイルにまたがり、設計判断が必要な変更をいきなり実装させると失敗した。最初にやるべきことは？", a: "Plan Mode などで、まず読み取り専用で調査・計画させ、人が確認してから実装に進む。" }
      ]
    },
    {
      id: "delegation",
      title: "サブエージェントへの委任",
      objectives: [
        { text: "コーディネーターに戻らずに完了できるよう、調査結果・構造化データ・出典メタデータをサブエージェントのプロンプトに含める", score: 67 },
        { text: "委任戦略（目標指向 vs 手続き的指示）を選び、適応性とコーディネーターの可視性・制御を両立する", score: 50 }
      ],
      sources: [
        { title: "Anthropic Engineering: How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", focus: "「Prompt engineering and evaluations for research agents」の『Teach the orchestrator how to delegate』" },
        { title: "Claude Code Docs: Subagents", url: "https://code.claude.com/docs/en/sub-agents", focus: "サブエージェントは独立したコンテキストウィンドウ・独自のツールとシステムプロンプトで動く" }
      ],
      keyPoints: [
        "サブエージェントは自分専用のコンテキストウィンドウで動き、メインの会話は見えない。必要な情報は委任時に明示的に渡す。",
        "記事では、委任時に各サブエージェントへ「目的」「出力形式」「使うツールや情報源の指針」「タスクの境界」を伝えるべきとしている。指示が短く曖昧だと、重複調査や抜け漏れが起きた。",
        "【試験目標からの答え筋】ファイルパス・行番号・特定済みの原因・準拠すべき仕様など、前段で分かっていることは全部渡す（自己完結したプロンプト）。",
        "【試験目標からの答え筋】手順を細かく固定しすぎると想定外の構造に対応できない。丸投げすると制御を失う。→「何を明らかにするか・範囲・返す形式」を決め、探索手順は任せる。返却は根拠付きの構造化レポートにして可視性を確保。"
      ],
      checks: [
        { q: "サブエージェントに「さっき見つかったバグを直して」とだけ渡したら失敗した。なぜ？", a: "サブエージェントは親の会話を見られないため。ファイルパス・行番号・原因・仕様などを明示的に渡す必要がある。" },
        { q: "委任プロンプトに含めるべき4要素（記事より）は？", a: "目的、出力形式、ツールや情報源の指針、タスクの境界。" }
      ]
    },
    {
      id: "long-running",
      title: "長時間タスクの状態管理（永続化・中断再開・コンテキスト最適化）",
      objectives: [
        { text: "完了済み作業を繰り返さず、中断後に確実に再開できる状態永続化戦略", score: 0 },
        { text: "実用トークン上限を超えても品質を保つコンテキスト最適化（要約・スライディングウィンドウ・構造化状態・選択的保持）", score: 0 }
      ],
      sources: [
        { title: "Anthropic Engineering: Effective context engineering for AI agents", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", focus: "「Context engineering for long-horizon tasks」の Compaction / Structured note-taking / Sub-agent architectures" },
        { title: "Anthropic Engineering: Effective harnesses for long-running agents", url: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents", focus: "進捗ファイル・機能リスト（JSON）・git を使ったセッション間の引き継ぎ" },
        { title: "Anthropic Engineering: How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", focus: "計画を外部メモリに保存、サブエージェントの成果物をファイルに書き出す話" }
      ],
      keyPoints: [
        "長期タスクの3つの手法: ①Compaction（会話を要約して新しいコンテキストで続ける。古いツール結果を消すのは最も安全で軽い方法）②Structured note-taking（コンテキストの外のファイルにメモ・ToDoを書き、後で読み戻す）③Sub-agent architectures（サブエージェントが深掘りし、凝縮した要約だけを返す）。",
        "long-running harnesses の記事では、進捗ファイルと git の履歴で次のセッションが状況をすぐ把握できるようにしている。機能リストは Markdown より JSON のほうがモデルに不適切に書き換えられにくいため JSON で管理。",
        "multi-agent research の記事では、コンテキストが上限に近づく前に計画を外部メモリに保存して引き継ぐ。サブエージェントの成果物はファイルシステムに直接書き出し、コーディネーターには軽い参照だけ返すことで「伝言ゲーム」による劣化を防いでいる。",
        "【試験目標からの答え筋】散文の要約だけに頼ると識別子や制約が丸められて消える → 決定事項・制約・未完了タスクは構造化状態で保持し、経緯だけ要約。中断時は完了済みを記録してスキップし、変更されたファイルだけ再分析。"
      ],
      checks: [
        { q: "context engineering の記事が挙げる長期タスク向けの3手法は？", a: "Compaction、Structured note-taking、Sub-agent architectures。" },
        { q: "harnesses の記事で、機能リストを Markdown ではなく JSON にした理由は？", a: "モデルが JSON ファイルを不適切に書き換えたり上書きしたりしにくいため。" },
        { q: "300件中180件で中断したパイプライン。181件目から確実に再開する設計は？", a: "タスクごとの状態と結果を外部（DB・ファイル）に完了の都度保存し、再開時は未完了分だけ実行する。" }
      ]
    },
    {
      id: "synthesis",
      title: "矛盾データの統合と、報告範囲の線引き",
      objectives: [
        { text: "矛盾するデータを1つに丸めず、確立した知見と争いのある主張を区別し、出典レベルの不確実性を保持する統合エージェント", score: 0 },
        { text: "明示的な包含・除外の境界を定義し、信頼性の低いカテゴリーで結果を生成させないプロンプト基準", score: 50 }
      ],
      sources: [
        { title: "Claude API Docs: Reduce hallucinations", url: "https://docs.claude.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations", focus: "「わからない」と言うことを許可する／引用で裏付ける／裏付けがない主張は撤回させる" },
        { title: "Claude API Docs: Citations", url: "https://docs.claude.com/en/docs/build-with-claude/citations", focus: "回答の各主張を元文書の箇所に紐付ける機能" },
        { title: "Anthropic Engineering: How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", focus: "CitationAgent（出典付け専用のエージェント）、情報源の質の見極め" }
      ],
      keyPoints: [
        "Reduce hallucinations では、Claude に「わからない」と言うことを明示的に許可する、主張を原文の引用で裏付けさせる、裏付けのない主張は撤回させる、といった方法を紹介している。",
        "multi-agent research では、最後に出典付け専用の CitationAgent が各主張を情報源に紐付ける。また、SEO向けの記事より一次情報を優先するよう情報源の質を見極めさせている。",
        "【試験目標からの答え筋】矛盾は消さずに見せる。出力スキーマに「確立した事実」と「食い違っている主張（どのソースが・どの確度で・何と言っているか）」を分けて持たせる。",
        "【試験目標からの答え筋】「重要なものだけ報告して」のような曖昧な指示ではなく、報告する対象（例: 認可漏れ・インジェクション）と報告しない対象（例: スタイル、生成コード、テストのモック）を具体例付きで明示する。"
      ],
      checks: [
        { q: "2つのサブエージェントが異なる根本原因を報告した。統合エージェントはどうすべき？", a: "どちらかに決め打ちせず、両方の主張を出典と確度付きで併記し、確立した事実と分けて出力する。" },
        { q: "自動コードレビューの誤検知（スタイル指摘など）が多い。プロンプトをどう直す？", a: "報告対象と除外対象を具体的に定義し、境界上の例（報告すべきでない例）も示す。" }
      ]
    },
    {
      id: "claude-code",
      title: "Claude Code の構成と組み込みツール",
      objectives: [
        { text: "Claude Code の構成メカニズム（CLAUDE.md / rules / Skills / Hooks）の使い分け", score: 0 },
        { text: "作業内容に応じた組み込みツール（Grep・Glob・Read・Bash）の選択", score: 50 },
        { text: "Grep・Glob・Read を使った、コンテキストを節約する段階的なコードベース探索", score: 80 }
      ],
      sources: [
        { title: "Claude Code Docs: Memory（CLAUDE.md と .claude/rules/）", url: "https://code.claude.com/docs/en/memory", focus: "CLAUDE.md の配置場所と読み込み、paths frontmatter による条件付きルール" },
        { title: "Claude Code Docs: Skills", url: "https://code.claude.com/docs/en/skills", focus: "SKILL.md の frontmatter（description、allowed-tools、context: fork）" },
        { title: "Claude Code Docs: Hooks", url: "https://code.claude.com/docs/en/hooks", focus: "PreToolUse / PostToolUse、終了コード2によるブロック" },
        { title: "Claude Code Docs: Settings（permissions）", url: "https://code.claude.com/docs/en/settings", focus: "permissions の allow / deny ルール" }
      ],
      keyPoints: [
        "CLAUDE.md はセッション開始時に読み込まれる。常に必要な情報（ビルド・テストコマンド、全体の規約）を簡潔に書く。",
        ".claude/rules/ のファイルに frontmatter で paths（glob）を書くと、該当ファイルを扱うときだけ読み込まれる。paths なしのルールは常時読み込み。",
        "Skills は必要なときに使う手順書。スラッシュコマンドで呼ぶか、description がタスクに合うと使われる。",
        "Hooks は LLM の判断に頼らず決まったタイミングで必ず実行される。PreToolUse で終了コード2を返すとツール実行をブロックし、stderr の内容が Claude に伝わる。",
        "条件なしの禁止・許可（例: .env の読み取り禁止）は settings の permissions.deny / allow で宣言する。",
        "Glob はファイル名・パスのパターン検索、Grep はファイル内容の検索、Read はファイルを読む（範囲指定可）、Bash はテストやビルドなどのコマンド実行。検索・閲覧に Bash の find / grep / cat を使うより専用ツールを優先する。"
      ],
      checks: [
        { q: "「ファイル保存後に必ず prettier を実行」はどの仕組みで実現する？", a: "PostToolUse フック。CLAUDE.md に書くだけでは保証されない。" },
        { q: "src/database/migrations/** を触るときだけ効かせたい規約はどこに書く？", a: ".claude/rules/ のファイルに paths frontmatter で glob を指定する。" },
        { q: "「全ファイルから verifyToken( の呼び出し箇所と行番号を探す」に使う組み込みツールは？", a: "Grep（内容検索）。ファイル名で探すなら Glob。" }
      ]
    },
    {
      id: "cicd-mcp",
      title: "CI/CD での Claude Code と MCP 統合",
      objectives: [
        { text: "非対話フラグ・権限モード・コストとターンの上限で CI/CD 向けに Claude Code CLI を構成する", score: 50 },
        { text: "正しいサーバースコープ、環境変数展開による認証、ツール検出の検証で MCP サーバーを統合する", score: 50 }
      ],
      sources: [
        { title: "Claude Code Docs: Headless mode / Run programmatically", url: "https://code.claude.com/docs/en/headless", focus: "-p、--output-format、--allowedTools" },
        { title: "Claude Code Docs: CLI reference", url: "https://code.claude.com/docs/en/cli-reference", focus: "--max-turns、--max-budget-usd、--permission-mode、--disallowedTools" },
        { title: "Claude Code Docs: MCP", url: "https://code.claude.com/docs/en/mcp", focus: "インストールスコープ（local / project / user）、.mcp.json の環境変数展開" }
      ],
      keyPoints: [
        "-p（--print）で非対話実行。--output-format json / stream-json で後続の処理がパースしやすくなる。",
        "--allowedTools で確認なしに使えるツールを限定する（例: \"Read,Grep,Glob\" や \"Bash(npm test)\" のようにコマンド単位でも指定可）。--disallowedTools で禁止も可能。",
        "--max-turns でターン数、--max-budget-usd で推定コストの上限を設定し、暴走を止める（どちらも print モード用）。",
        "--dangerously-skip-permissions（bypassPermissions）はすべての権限チェックを飛ばす。インターネットから隔離されたコンテナなどのサンドボックス以外では使わないのが原則。",
        "MCP のスコープ: local（既定。自分だけ・このプロジェクトだけ）/ project（リポジトリの .mcp.json、チームで共有）/ user（自分の全プロジェクト）。同名なら local > project > user の順で優先。",
        ".mcp.json では ${VAR} や ${VAR:-default} で環境変数を展開できるので、トークンを直書きせずに共有できる。project スコープのサーバーは使用前に承認が求められる。接続とツールは claude mcp list や /mcp で確認。"
      ],
      checks: [
        { q: "CI でレビュー結果を JSON で受け取り、読み取り系ツールだけを許可し、暴走も防ぎたい。主なフラグは？", a: "-p、--output-format json、--allowedTools \"Read,Grep,Glob\"、--max-turns、--max-budget-usd。" },
        { q: "チームで同じ MCP サーバーを共有しつつ、個人のトークンはリポジトリに入れたくない。どうする？", a: "project スコープ（.mcp.json）に定義し、トークンは ${JIRA_API_TOKEN} のような環境変数展開で参照する。" },
        { q: "MCP の3つのスコープと優先順位は？", a: "local・project・user。優先順位は local > project > user。" }
      ]
    },
    {
      id: "batch",
      title: "API処理モードの選択（Messages API と Message Batches API）",
      objectives: [
        { text: "レイテンシー要件・ブロッキング動作・許容される処理時間に基づいて、同期の Messages API か非同期の Message Batches API を選ぶ", score: 75 }
      ],
      sources: [
        { title: "Claude API Docs: Batch processing", url: "https://docs.claude.com/en/docs/build-with-claude/batch-processing", focus: "料金、処理時間、上限、向いている用途" }
      ],
      keyPoints: [
        "Message Batches API は料金が通常の50%。多くのバッチは1時間以内に終わるが、最大24時間かかることがある。",
        "1バッチの上限は 100,000 リクエストまたは 256MB。結果は作成から29日間取得できる。",
        "すぐに応答が必要な処理（ユーザーが待っているチャット、結果を見て次の処理に進むCIのブロッキングゲート）には向かない。評価や大量データの一括処理など、待てる処理に向く。"
      ],
      checks: [
        { q: "PRごとに結果を待ってマージ可否を決める CI チェックに Batches API は適切？", a: "不適切。最大24時間かかり得るため、ブロッキングする処理には同期の Messages API を使う。" },
        { q: "毎晩5万件のログを採点し、翌朝までに結果があればよい。どちらを使う？", a: "Message Batches API（50%安く、24時間以内の処理枠で足りる）。" }
      ]
    }
  ]
};
