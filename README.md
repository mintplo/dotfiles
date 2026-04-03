# dotfiles

macOS 개발 환경 설정. [GNU Stow](https://www.gnu.org/software/stow/)로 심볼릭 링크 관리.

## 포함된 패키지

| 패키지 | 경로 | 설명 |
|--------|------|------|
| `nvim` | `~/.config/nvim/` | Neovim (LazyVim) |
| `claude` | `~/.claude/` | Claude Code 설정, SuperClaude 프레임워크, RTK hook |
| `pi` | `~/.pi/` | Pi (Codex) 에이전트 설정 |
| `ghostty` | `~/Library/Application Support/com.mitchellh.ghostty/` | Ghostty 터미널 설정 + cursor shaders |

## 설치

### 1. 사전 준비

```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# GNU Stow
brew install stow
```

### 2. 저장소 클론 및 Stow

```bash
git clone git@github.com:<username>/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
stow nvim claude pi ghostty
```

> 기존 파일이 있으면 `stow`가 충돌을 알려줍니다. 기존 파일을 dotfiles로 흡수하려면 `stow --adopt <패키지>` 후 `git checkout .`으로 원본 복원.

### 3. 폰트 설치

Ghostty에서 사용하는 폰트:

```bash
# Hack Nerd Font (영문 + 아이콘)
brew install --cask font-hack-nerd-font

# D2Coding (한글)
brew install --cask font-d2coding
```

### 4. Neovim

```bash
brew install neovim

# 첫 실행 시 lazy.nvim이 자동으로 플러그인 설치
nvim
```

### 5. Claude Code

```bash
# Claude Code 설치
npm install -g @anthropic-ai/claude-code

# RTK (토큰 최적화 CLI proxy) - Claude Code hook에서 사용
cargo install rtk

# RTK 설치 확인
rtk --version
```

### 6. Ghostty

[ghostty.org](https://ghostty.org)에서 다운로드 후 설치.

### 7. Pi (Codex)

```bash
npm install -g @openai/codex
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
# 새 패키지 추가 예시 (zsh)
mkdir -p ~/.dotfiles/zsh
mv ~/.zshrc ~/.dotfiles/zsh/
cd ~/.dotfiles && stow zsh

# 패키지 제거 (심볼릭 링크 해제)
cd ~/.dotfiles && stow -D <패키지>
```
