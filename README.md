# dotfiles

macOS 개발 환경 설정. [GNU Stow](https://www.gnu.org/software/stow/)로 심볼릭 링크 관리.

## 포함된 패키지

| 패키지 | 경로 | 설명 |
|--------|------|------|
| `nvim` | `~/.config/nvim/` | Neovim (LazyVim) |
| `claude` | `~/.claude/` | Claude Code — SuperClaude 프레임워크, 커스텀 에이전트, 스킬, RTK hook |
| `pi` | `~/.pi/` | Pi (Codex) 에이전트 설정 |
| `ghostty` | `~/Library/Application Support/com.mitchellh.ghostty/` | Ghostty 터미널 — cursor shaders, 한글 키바인딩 |
| `lazygit` | `~/Library/Application Support/lazygit/` | Lazygit — Catppuccin Macchiato 테마, delta pager |
| `zsh` | `~/.zshrc` | oh-my-zsh + p10k, uv, nvm (auto .nvmrc), fzf |

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
stow nvim claude pi ghostty lazygit zsh
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

### 9. Pi (Codex)

```bash
npm install -g @openai/codex
```

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
| `codex` | `npm install -g @openai/codex` | pi |
| `oh-my-zsh` | 설치 스크립트 | zsh |
| `powerlevel10k` | git clone | zsh |
| `fzf` | `brew install fzf` | zsh |
| `uv` | `curl` 설치 스크립트 | zsh (Python) |
| `nvm` | `brew install nvm` | zsh (Node) |

### 한 줄 설치 (brew)

```bash
brew install stow neovim lazygit delta jq node fzf nvm
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
