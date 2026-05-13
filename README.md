# dotfiles

macOS 개발 환경 설정. [GNU Stow](https://www.gnu.org/software/stow/)로 심볼릭 링크 관리.

## 포함된 패키지

| 패키지 | 경로 | 설명 |
|--------|------|------|
| `nvim` | `~/.config/nvim/` | Neovim (LazyVim) |
| `claude` | `~/.claude/` | Claude Code — SuperClaude 프레임워크, 커스텀 에이전트, 스킬, RTK hook |
| `pi` | `~/.pi/`, `~/.mcporter/` | Pi 에이전트 — cmux 알림, `.env` 차단, pi-nvim 통합, MCPorter/Lazyweb MCP |
| `ghostty` | `~/Library/Application Support/com.mitchellh.ghostty/` | Ghostty 터미널 — cursor shaders, 한글 키바인딩 |
| `lazygit` | `~/Library/Application Support/lazygit/` | Lazygit — Catppuccin Macchiato 테마, delta pager |
| `zsh` | `~/.zshrc` | oh-my-zsh + p10k, uv, nvm (auto .nvmrc), fzf |
| `agents` | `~/.agents/` | Claude Code + Pi 공유 skills (agent-browser, dogfood 등) |

## 설치

### 1. Homebrew + Stow

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install stow
```

### 2. 저장소 클론 및 Stow

```bash
git clone git@github.com:mintplo/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
stow nvim claude pi ghostty lazygit zsh agents
```

> 기존 파일이 있으면 `stow`가 충돌을 알려줍니다. 기존 파일을 dotfiles로 흡수하려면 `stow --adopt <패키지>` 후 `git checkout .`으로 원본 복원.

### 3. 폰트

Ghostty에서 사용:

```bash
# Hack Nerd Font (영문 + 아이콘)
brew install --cask font-hack-nerd-font

# D2Coding (한글 — CJK 코드포인트 매핑)
brew install --cask font-d2coding
```

### 4. Zsh

```bash
# oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k

# 플러그인
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
git clone https://github.com/joshskidmore/zsh-fzf-history-search ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-fzf-history-search

# fzf
brew install fzf
$(brew --prefix)/opt/fzf/install

# uv (Python)
curl -LsSf https://astral.sh/uv/install.sh | sh

# nvm (Node)
brew install nvm
```

### 5. Neovim

```bash
brew install neovim

# 첫 실행 시 lazy.nvim이 플러그인 자동 설치
nvim
```

### 6. Lazygit + Delta

lazygit 설정에서 delta를 diff pager로 사용:

```bash
brew install lazygit delta
```

### 7. Ghostty

[ghostty.org](https://ghostty.org)에서 다운로드 후 설치.

### 8. Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

RTK (토큰 최적화 CLI proxy) — Claude Code의 PreToolUse hook에서 bash 명령어를 자동 rewrite:

```bash
# Rust 툴체인 필요
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install rtk

# 설치 확인
rtk --version
```

### 9. Pi

```bash
# Pi 에이전트 설치 (badlogic/pi-mono)
npm install -g @mariozechner/pi-coding-agent
```

Pi 재시작 시 `settings.json`의 `packages`에서 선언된 패키지들이 자동 설치됩니다:
- **pi-nvim** — Neovim과 Unix 소켓으로 통신 (같은 cwd에서 실행되는 Pi 세션 자동 발견)
- **checkpoint-pi** — 매 턴마다 git ref로 작업 트리 스냅샷, 대화 포크/복구 시 파일도 함께 복원
- **@tmustier/pi-ralph-wiggum** — `.ralph/<name>.md` 체크리스트 기반 장기 반복 작업 루프 (최대 50회)
- **addyosmani/agent-skills** — Agent Skills 표준 기반 엔지니어링 워크플로우 스킬 모음 (`/skill:test-driven-development`, `/skill:code-review-and-quality` 등)

Pi 로컬 확장 의존성은 git clone/stow 후 별도 설치가 필요합니다. 기존 설치에서 mcporter 설정을 새로 적용하려면 먼저 `stow -R pi`로 `~/.mcporter/` 링크를 갱신합니다:

```bash
cd ~/.dotfiles
stow -R pi

cd ~/.dotfiles/pi/.pi/agent/extensions && npm ci
cd ~/.dotfiles/pi/.pi/agent/extensions/lsp && npm ci
cd ~/.dotfiles/pi/.pi/agent/extensions/mcporter && npm ci
```

Lazyweb MCP는 MCPorter에 등록되어 있고, 토큰은 로컬 `.env`에만 저장합니다. 토큰은 git에 커밋하지 않습니다:

```bash
printf 'LAZYWEB_MCP_TOKEN=%s\n' '<LAZYWEB_TOKEN>' > ~/.pi/agent/extensions/mcporter/.env
chmod 600 ~/.pi/agent/extensions/mcporter/.env
```

Pi 안에서는 `mcp({ server: "lazyweb" })`로 도구를 확인하고, 예를 들어 `mcp({ call: "lazyweb.lazyweb_search", args: { query: "pricing page", limit: 3 } })`처럼 호출합니다. 필요하면 `/mcp status`, `/mcp refresh lazyweb`를 사용합니다.

Pi 로컬 확장 (`~/.pi/agent/extensions/`):
- **mcporter/** — MCPorter 기반 MCP 브릿지. Lazyweb MCP를 `mcp` 도구로 호출
- **cmux-notify.ts** — [cmux](https://github.com/manaflow-ai/cmux) 통합 (사이드바 상태 + 알림)
- **filter-output.ts** — API 키, 토큰, DB 커넥션 문자열 등 자동 마스킹 + `.env`/credentials 파일 읽기 차단
- **security.ts** — 위험한 bash 명령 차단 (`rm -rf`, `sudo`, `dd`) + 민감 경로 쓰기 차단 (`.ssh/`, `.git/`, lock 파일)

### 의존성 요약

| 도구 | 설치 방법 | 필요한 패키지 |
|------|----------|--------------|
| `stow` | `brew install stow` | 전체 |
| `neovim` | `brew install neovim` | nvim |
| `lazygit` | `brew install lazygit` | lazygit |
| `delta` | `brew install delta` | lazygit |
| `ghostty` | 홈페이지 다운로드 | ghostty |
| Hack Nerd Font | `brew install --cask font-hack-nerd-font` | ghostty |
| D2Coding | `brew install --cask font-d2coding` | ghostty |
| `claude-code` | `npm install -g @anthropic-ai/claude-code` | claude |
| `rtk` | `cargo install rtk` | claude |
| `jq` | `brew install jq` | claude (RTK hook) |
| `rust` | `rustup` | claude (RTK 빌드) |
| `node` / `npm` | `brew install node` | claude, pi |
| `pi-coding-agent` | `npm install -g @mariozechner/pi-coding-agent` | pi |
| `cmux` | manaflow-ai/cmux | pi (선택적, 알림용) |
| `fd` | `brew install fd` | nvim (venv-selector) |
| `agent-browser` | `brew install agent-browser` | agents (선택적) |
| `oh-my-zsh` | 설치 스크립트 | zsh |
| `powerlevel10k` | git clone | zsh |
| `fzf` | `brew install fzf` | zsh |
| `uv` | `curl` 설치 스크립트 | zsh (Python) |
| `nvm` | `brew install nvm` | zsh (Node) |

### 한 줄 설치 (brew)

```bash
brew install stow neovim lazygit delta jq node fzf nvm fd
brew install --cask font-hack-nerd-font font-d2coding
```

## 동기화

```bash
# 설정 변경 후 push
cd ~/.dotfiles && git add -A && git commit -m "update configs" && git push

# 다른 머신에서 pull
cd ~/.dotfiles && git pull
```

## 패키지 추가/제거

```bash
# 새 패키지 추가 예시
mkdir -p ~/.dotfiles/<패키지>
mv ~/.<config> ~/.dotfiles/<패키지>/
cd ~/.dotfiles && stow <패키지>

# 패키지 제거 (심볼릭 링크 해제)
cd ~/.dotfiles && stow -D <패키지>
```
