# 📚 PinayMate Documentation

> **Quick navigation** — find any doc in seconds.

---

## 📁 Directory Map

| Folder | Purpose | Files |
|--------|---------|-------|
| [`architecture/`](./architecture/) | Codebase design, algorithms, technical decisions | 6 |
| [`refactoring/`](./refactoring/) | Past & planned refactoring sessions | 9 |
| [`release/`](./release/) | Launch readiness, checklists, risk registers | 6 |
| [`operations/`](./operations/) | Runbooks, operator checklists, Supabase ops | 7 |
| [`testing/`](./testing/) | QA scripts, testing guides | 5 |
| [`guides/`](./guides/) | Business rules, UX audits, AI prompts | 3 |
| [`setup/`](./setup/) | Installation, environment, auth setup | 7 |
| [`design/`](./design/) | UI mockups & design assets | — |
| [`evidence/`](./evidence/) | Dated release evidence artifacts | 279 |

---

## 🏗️ Architecture

- [APP_VS_SRC_ARCHITECTURE](./architecture/APP_VS_SRC_ARCHITECTURE.md) — `app/` vs `src/` folder analysis & rules
- [CHAT_UI_FLOW](./architecture/CHAT_UI_FLOW.md) — Messaging system flow & safety requirements
- [SMART_MATCHING_ALGORITHM](./architecture/SMART_MATCHING_ALGORITHM.md) — Matching score algorithm (0–100)
- [ZUSTAND_IMPLEMENTATION](./architecture/ZUSTAND_IMPLEMENTATION.md) — Zustand state management setup
- [COMMERCE_SCOPE_DECISION](./architecture/COMMERCE_SCOPE_DECISION.md) — Commerce feature scope decision
- [WAITLIST_ABUSE_RATE_LIMIT_DECISION](./architecture/WAITLIST_ABUSE_RATE_LIMIT_DECISION.md) — Rate-limiting design

## 🔧 Refactoring

- [REFACTORING_PLAN](./refactoring/REFACTORING_PLAN.md) — Master refactoring plan (feature-first modular)
- [SYSTEM_AUDIT_REPORT](./refactoring/SYSTEM_AUDIT_REPORT.md) — Full system audit driving refactoring
- [REFACTORING_AUDIT_REPORT](./refactoring/REFACTORING_AUDIT_REPORT.md) — Audit report
- [INDEX_REFACTORING_SUMMARY](./refactoring/INDEX_REFACTORING_SUMMARY.md) — Index screen: 1,836 lines → 7 modules
- [INDEX_REFACTORING_VISUAL](./refactoring/INDEX_REFACTORING_VISUAL.md) — Visual before/after
- [MESSAGES_REFACTORING](./refactoring/MESSAGES_REFACTORING.md) — Messages screen refactoring
- [PROFILE_REFACTORING](./refactoring/PROFILE_REFACTORING.md) — Profile screen refactoring
- [CHAT_UPDATE](./refactoring/CHAT_UPDATE.md) — Chat screen structural changes
- [REFACTORING_SESSION_SUMMARY](./refactoring/REFACTORING_SESSION_SUMMARY.md) — Session log

## 🚀 Release

- [RELEASE_READINESS](./release/RELEASE_READINESS.md) — Overall release readiness tracker
- [LAUNCH_SIGNOFF_CHECKLIST](./release/LAUNCH_SIGNOFF_CHECKLIST.md) — Sign-off gates
- [LAUNCH_EVIDENCE_PACKET](./release/LAUNCH_EVIDENCE_PACKET.md) — Central launch evidence
- [PINAYMATE_LAUNCH_STATE_MATRIX](./release/PINAYMATE_LAUNCH_STATE_MATRIX.md) — What the product may/may-not claim
- [PINAYMATE_RELEASE_RISK_REGISTER](./release/PINAYMATE_RELEASE_RISK_REGISTER.md) — Risk register
- [PRODUCTION_OWNERSHIP_CHECKLIST](./release/PRODUCTION_OWNERSHIP_CHECKLIST.md) — Production ownership gate

## ⚙️ Operations

- [SAFETY_MODERATION_RUNBOOK](./operations/SAFETY_MODERATION_RUNBOOK.md) — Reports, verification, block/unmatch
- [SUPABASE_RELEASE_OPERATOR_CHECKLIST](./operations/SUPABASE_RELEASE_OPERATOR_CHECKLIST.md) — Supabase release ops
- [SUPABASE_LIVE_PROOF_COMMANDS](./operations/SUPABASE_LIVE_PROOF_COMMANDS.md) — Staging/production proof capture
- [SUPABASE_CHAT_INTEGRATION](./operations/SUPABASE_CHAT_INTEGRATION.md) — Chat backend integration runbook
- [DEPENDENCY_AUDIT_REMEDIATION](./operations/DEPENDENCY_AUDIT_REMEDIATION.md) — Dependency remediation
- [SECRET_HYGIENE_REMEDIATION](./operations/SECRET_HYGIENE_REMEDIATION.md) — Secret/env hygiene
- [FIX_DATABASE_ERRORS](./operations/FIX_DATABASE_ERRORS.md) — Database troubleshooting

## 🧪 Testing

- [NATIVE_QA_SCRIPT](./testing/NATIVE_QA_SCRIPT.md) — Native device QA script
- [CHAT_TESTING_GUIDE](./testing/CHAT_TESTING_GUIDE.md) — Chat integration testing
- [TESTING_GUIDE](./testing/TESTING_GUIDE.md) — General testing guide (Like feature)
- [PRODUCT_DESIGN_QA_STANDARD](./testing/PRODUCT_DESIGN_QA_STANDARD.md) — Design QA standard
- [MANUAL_EMAIL_VERIFICATION](./testing/MANUAL_EMAIL_VERIFICATION.md) — SQL snippet for email verification

## 📖 Guides

- [BUSINESS_RULES](./guides/BUSINESS_RULES.md) — MVP business rules
- [ACCOUNT_CREATION_UX_AUDIT](./guides/ACCOUNT_CREATION_UX_AUDIT.md) — Account creation flow UX audit
- [AI_ARCHITECTURE_GUIDE](./guides/AI_ARCHITECTURE_GUIDE.md) — Copy-paste AI prompt for architecture

## 🛠️ Setup

- [SETUP_CHECKLIST](./setup/SETUP_CHECKLIST.md) — Full setup checklist
- [SUPABASE_SETUP_INSTRUCTIONS](./setup/SUPABASE_SETUP_INSTRUCTIONS.md) — Supabase project setup
- [EMAIL_VERIFICATION_SETUP](./setup/EMAIL_VERIFICATION_SETUP.md) — Email verification config
- [ENABLE_EMAIL_SIGNUP](./setup/ENABLE_EMAIL_SIGNUP.md) — Enable email signup
- [FINAL_EMAIL_FLOW_SETUP](./setup/FINAL_EMAIL_FLOW_SETUP.md) — Final email flow setup
- [REDIRECT_URLS_QUICK](./setup/REDIRECT_URLS_QUICK.md) — Auth redirect URLs
- [QUICK_FIX_MANUAL_VERIFICATION](./setup/QUICK_FIX_MANUAL_VERIFICATION.md) — Dev quick-fix: manual user verification
