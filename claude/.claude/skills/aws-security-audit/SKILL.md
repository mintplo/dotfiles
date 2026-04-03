---
name: aws-security-audit
description: Use when performing monthly AWS security audits, checking IAM permissions, backup status, GuardDuty findings, CloudTrail logs, network security, encryption, and resource hygiene. Triggered by keywords like "AWS 감사", "보안 점검", "security audit", "monthly audit".
---

# AWS 월간 보안 점검 감사

## Overview

매월 정기적으로 수행하는 AWS 보안 감사 스킬. AWS CLI 기반으로 IAM 권한, 백업, 위협 탐지, 네트워크, 암호화, 모니터링, 리소스 상태를 점검하고 마크다운 보고서를 자동 생성한다.

## When to Use

- 매월 정기 AWS 보안 감사 수행 시
- "AWS 감사", "보안 점검", "security audit" 키워드
- NOT: 일회성 특정 리소스 조사 (그냥 AWS CLI 직접 사용)

## Prerequisites

사용자에게 **MFA 인증된 AWS 세션 토큰**을 요청한다. 토큰 3개를 받아 모든 AWS CLI 호출에 포함해야 한다.

```
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
```

**중요**: 매 Bash 호출마다 환경변수를 포함해야 한다 (쉘 상태 미유지).

## Audit Flow

```dot
digraph audit {
  rankdir=LR;
  "토큰 수신" -> "자격 증명 확인";
  "자격 증명 확인" -> "병렬 점검 실행";
  "병렬 점검 실행" -> "보고서 생성";
  "보고서 생성" -> "조치 권고 정리";
}
```

1. 사용자로부터 AWS 세션 토큰 수신
2. `aws sts get-caller-identity`로 자격 증명 확인
3. 점검 기간 확인 (기본: 전월 1일~말일)
4. 아래 8개 카테고리 점검 실행 (가능한 병렬)
5. 마크다운 보고서 생성 및 저장

## Checklist (8 Categories)

### 1. IAM 권한 현황 (us-east-1)

| 점검 항목 | AWS CLI |
|----------|---------|
| 사용자 목록 + 최근 로그인 | `aws iam list-users` |
| 사용자별 MFA 설정 | `aws iam list-mfa-devices --user-name` |
| Access Key 목록 + 상태 | `aws iam list-access-keys --user-name` |
| Access Key 마지막 사용 | `aws iam get-access-key-last-used --access-key-id` |
| 사용자별 그룹 | `aws iam list-groups-for-user --user-name` |
| 사용자별 직접 연결 정책 | `aws iam list-attached-user-policies --user-name` |
| 그룹 목록 | `aws iam list-groups` |
| 그룹별 연결 정책 | `aws iam list-attached-group-policies --group-name` |
| IAM 역할 목록 | `aws iam list-roles` |
| 고객 관리형 정책 | `aws iam list-policies --scope Local` |
| 패스워드 정책 | `aws iam get-account-password-policy` |

**점검 포인트**:
- MFA 미설정 사용자
- 미사용/장기 미사용 Access Key
- 과도한 권한 (AdministratorAccess 등)
- 패스워드 정책 적합성 (길이, 복잡성, 만료)

### 2. 백업 현황 (ap-northeast-2)

| 점검 항목 | AWS CLI |
|----------|---------|
| Backup 볼트 목록 | `aws backup list-backup-vaults` |
| Backup 플랜 목록 | `aws backup list-backup-plans` |
| 점검 기간 내 백업 작업 | `aws backup list-backup-jobs --by-created-after --by-created-before` |
| RDS 인스턴스 백업 설정 | `aws rds describe-db-instances` (BackupRetentionPeriod 확인) |
| RDS 수동 스냅샷 | `aws rds describe-db-snapshots --snapshot-type manual` |

**점검 포인트**:
- 백업 작업 실패 건
- BackupRetentionPeriod=0 인 RDS 인스턴스
- 백업 플랜 정상 실행 여부

### 3. GuardDuty 위협 탐지 (리소스 사용 리전만)

| 점검 항목 | AWS CLI |
|----------|---------|
| Detector 목록 | `aws guardduty list-detectors` |
| Detector 상태 + 기능 | `aws guardduty get-detector --detector-id` |
| 기간 내 Findings | `aws guardduty list-findings --finding-criteria` |
| Finding 상세 (있을 경우) | `aws guardduty get-findings --finding-ids` |

**점검 포인트**:
- 리소스 사용 리전의 GuardDuty 활성화 여부 (리소스 미사용 리전은 해당 없음)
- 기능별 활성화 상태 (CloudTrail, DNS, FlowLogs, S3, RDS 등)
- 기간 내 보안 위협 탐지 건수 및 심각도

### 4. CloudTrail 로그 (ap-northeast-2)

> **참고**: 멀티 리전 Trail이 설정되어 있으면 us-east-1 글로벌 이벤트(Root 로그인 등)도 자동 수집됨. 별도 리전 설정 불필요.

| 점검 항목 | AWS CLI |
|----------|---------|
| Trail 목록 | `aws cloudtrail describe-trails` |
| Trail 로깅 상태 | `aws cloudtrail get-trail-status --name` |
| Root 계정 사용 여부 | `aws cloudtrail lookup-events --lookup-attributes AttributeKey=Username,AttributeValue=root` |
| 콘솔 로그인 실패 | `aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin` |

**점검 포인트**:
- 멀티 리전 추적 활성화
- S3 + CloudWatch Logs 이중 저장
- Root 계정 사용 이력
- 비정상 로그인 시도

### 5. 네트워크/인프라 보안 (ap-northeast-2)

| 점검 항목 | AWS CLI |
|----------|---------|
| 위험한 Security Group 규칙 | `aws ec2 describe-security-groups` (0.0.0.0/0 인바운드 필터) |
| Public S3 버킷 | `aws s3api list-buckets` + `get-public-access-block` |
| VPC Flow Logs | `aws ec2 describe-flow-logs` |
| WAF WebACL 현황 | `aws wafv2 list-web-acls --scope REGIONAL` |

**점검 포인트**:
- 22(SSH), 3389(RDP) 포트 0.0.0.0/0 오픈
- 퍼블릭 접근 가능 S3 버킷
- VPC Flow Logs 활성화 여부
- WAF 규칙 적용 현황

### 6. 암호화/키 관리 (ap-northeast-2)

| 점검 항목 | AWS CLI |
|----------|---------|
| KMS 키 목록 + 로테이션 | `aws kms list-keys` + `get-key-rotation-status` |
| RDS 암호화 상태 | `aws rds describe-db-instances` (StorageEncrypted 확인) |
| S3 버킷 암호화 | `aws s3api get-bucket-encryption` |

**점검 포인트**:
- KMS 키 자동 로테이션 미설정
- RDS 저장 데이터 미암호화
- S3 버킷 기본 암호화 미설정

### 7. 모니터링/규정 준수 (ap-northeast-2)

| 점검 항목 | AWS CLI |
|----------|---------|
| CloudWatch Alarms | `aws cloudwatch describe-alarms --state-value ALARM` |
| AWS Config 규칙 평가 | `aws configservice describe-compliance-by-config-rule` |
| Security Hub Findings | `aws securityhub get-findings` (ACTIVE, severity HIGH+) |
| Access Analyzer Findings | `aws accessanalyzer list-findings` |

**점검 포인트**:
- ALARM 상태 알람
- Config 규칙 NON_COMPLIANT 항목
- Security Hub HIGH/CRITICAL findings
- 외부 접근 가능 리소스

### 8. 미사용 리소스 점검 (ap-northeast-2)

| 점검 항목 | AWS CLI |
|----------|---------|
| 미연결 Elastic IP | `aws ec2 describe-addresses` (AssociationId 없는 것) |
| 미사용 EBS 볼륨 | `aws ec2 describe-volumes --filters Name=status,Values=available` |
| 중지된 EC2 인스턴스 | `aws ec2 describe-instances --filters Name=instance-state-name,Values=stopped` |

**점검 포인트**:
- 비용 낭비 리소스
- 방치된 리소스의 보안 위험

## Report Template

보고서 파일명: `aws-security-audit-YYYY-MM.md`
저장 위치: 프로젝트 루트

보고서 구조:
```
# AWS 보안 점검 감사 보고서
- 점검 기간, 계정, 점검일, 점검자
## 1. IAM 권한 현황
## 2. 백업 현황
## 3. GuardDuty 위협 탐지
## 4. CloudTrail 로그
## 5. 네트워크/인프라 보안
## 6. 암호화/키 관리
## 7. 모니터링/규정 준수
## 8. 미사용 리소스
## 종합 소견
  - ✅ 양호 항목
  - ⚠️ 조치 권고 항목 (우선순위: 높음/중간/낮음)
```

## Execution Tips

- **병렬 실행**: 독립적인 리전/서비스 조회는 병렬 Bash 호출
- **에러 처리**: AccessDenied 시 해당 항목 스킵하고 보고서에 "접근 권한 부족" 기재
- **리전 주의**: IAM은 글로벌(us-east-1), 나머지는 지정 리전
- **점검 기간**: 기본 전월, 사용자가 지정하면 해당 기간 사용
- **타임스탬프**: GuardDuty는 밀리초 epoch, CloudTrail은 ISO 8601

## Common Mistakes

| 실수 | 해결 |
|------|------|
| 세션 토큰 미포함 | 매 Bash 호출마다 3개 환경변수 export |
| MFA 미인증 토큰 | `LemonbaseEnforceMFA` 정책으로 차단됨 - MFA 세션 재발급 안내 |
| GuardDuty 기간 필터 | `updatedAt`는 밀리초 epoch 사용 |
| IAM 리전 | IAM API는 항상 us-east-1 (글로벌) |
| RDS 레플리카 백업 | Read Replica는 RetentionPeriod=0 이 정상일 수 있음 |
