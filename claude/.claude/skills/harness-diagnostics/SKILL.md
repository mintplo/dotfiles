---
name: harness-diagnostics
description: |
  코드베이스와 skill의 에이전트 친화도(harness)를 12개 원칙으로 진단하고 개선안을 제안합니다.
  사용 상황: 신규 환경 구축(Setup), 현 상태 점검(Audit), drift 정리(Maintenance).
  트리거: "하네스 진단", "harness audit", "에이전트 친화도 평가", "codebase audit", "하네스 점수", "harness setup", "하네스 설정", "drift check", "하네스 점검"
---

# Harness Diagnostics

에이전트 협업 환경의 성숙도를 평가하고 실행 가능한 리포트를 생성합니다.

## 핵심 원칙
1. **Read-only**: 기본 동작은 진단/제안만 수행
2. **Evidence-first**: 모든 판단은 파일 경로 근거 포함
3. **Principle-driven**: 12원칙 + 성숙도 프레임워크 기반 채점
4. **Self-referential**: 이 skill 자체도 동일 기준으로 진단 가능

## 모드 선택

| 모드 | 트리거 | 목적 | 워크플로우 |
|------|--------|------|-----------|
| **Setup** | 새 프로젝트, "환경 구축", "하네스 설정" | 초기 harness 구성 제안 | `references/setup-workflow.md` |
| **Audit** | "진단", "점검", "점수" | 점수화 + 개선 로드맵 | `references/audit-workflow.md` |
| **Maintenance** | "drift", "정리", "하네스 점검" | 변경 감지 + GC 제안 | `references/maintenance-workflow.md` |

모드가 애매하면 사용자에게 확인한다.

## 권장 사용 흐름

초기 프로젝트에서 이 skill을 사용할 때는 다음 순서를 권장한다.

1. 프레임워크 공식 스캐폴드로 최소 프로젝트 생성
2. **Setup** 모드로 현재 레포 상태 진단
3. 사용자가 별도로 제공한 요구사항을 목표 상태 설계 입력으로 반영
4. Setup 리포트를 기준으로 `AGENTS.md`, `docs/`, lint/test/CI, 구조 규칙을 먼저 정리
5. 그 다음 실제 기능 구현 진행

중요:
- Setup은 기본적으로 **read-only 진단/제안** 단계다.
- 사용자 요구사항은 **현재 상태의 근거**가 아니라 **목표 상태를 위한 설계 입력**으로 취급한다.
- 구현 요청이 함께 들어오더라도, 가능하면 먼저 Setup 리포트로 초기 harness 구조를 고정한 뒤 구현 단계로 넘어간다.

## 진단 대상

| 대상 | 판별 기준 | 체크리스트 |
|------|----------|-----------|
| **코드베이스** | git repo + 소스 존재 | `references/codebase-checklist.md` |
| **Skill** | skill 디렉토리 + SKILL.md | `references/skill-checklist.md` |

## 12개 하네스 원칙

`references/principles.md`를 기준으로 P1~P12를 0-10점으로 평가한다.

| # | 원칙 | 핵심 질문 |
|---|------|-----------|
| P1 | Agent Entry Point | AGENTS.md/CLAUDE.md가 명확한 진입점인가? |
| P2 | Map, Not Manual | 문서가 지도(map)인가, 매뉴얼인가? |
| P3 | Invariant Enforcement | 실수를 도구가 자동으로 잡는가? |
| P4 | Convention Over Configuration | 명시적 규칙이 있는가? |
| P5 | Progressive Disclosure | 정보가 필요할 때 찾을 수 있는가? |
| P6 | Layered Architecture | 의존성 방향이 명확한가? |
| P7 | Garbage Collection | stale 코드/문서를 정리하는가? |
| P8 | Observability | 에이전트가 작업 결과를 검증할 수 있는가? |
| P9 | Knowledge in Repo | 지식이 레포에 있는가? |
| P10 | Reproducibility | 동일 입력 → 동일 출력인가? |
| P11 | Modularity | 변경 영향이 격리되는가? |
| P12 | Self-Documentation | 코드가 의도를 표현하는가? |

## 성숙도 등급

| 등급 | 점수 | 의미 |
|------|------|------|
| L1 | 0-19 | None |
| L2 | 20-39 | Basic |
| L3 | 40-59 | Structured |
| L4 | 60-79 | Optimized |
| L5 | 80-100 | Autonomous |

가중치/산식은 `references/maturity-framework.md`를 따른다.

## 실행 절차

1. 모드 결정
2. 대상 판별 (코드베이스/Skill)
3. 해당 워크플로우 문서(`references/*-workflow.md`)를 Read하여 절차 수행
4. `references/report-template.md` 형식으로 리포트 출력
5. `references/verification-workflow.md`에 따라 검증 수행

## 참조 문서

| 파일 | 역할 |
|------|------|
| `references/principles.md` | 12원칙 상세 판단 기준 (0-10 채점 루브릭) |
| `references/maturity-framework.md` | 4개 차원/가중치/점수 산식 |
| `references/codebase-checklist.md` | 코드베이스 체크리스트 (84항목) |
| `references/skill-checklist.md` | Skill 체크리스트 (43항목) |
| `references/setup-workflow.md` | Setup 모드 워크플로우 |
| `references/audit-workflow.md` | Audit 모드 워크플로우 |
| `references/maintenance-workflow.md` | Maintenance 모드 워크플로우 |
| `references/verification-workflow.md` | 검증 워크플로우 |
| `references/report-template.md` | 리포트 출력 형식 |
| `references/score-template.md` | 점수 계산 표 |
| `references/score-template.json` | 점수 자동 계산 스키마 |
