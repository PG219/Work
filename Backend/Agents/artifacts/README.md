# Artifact Overview

This folder contains generated governance and compliance reference tables used by the Agents services.

## Crosswalk Paper Table

The file [`crosswalk_paper_table.md`](./crosswalk_paper_table.md) maps governance controls and review questions to three reference frameworks:

- EU AI Act
- NIST AI RMF
- ISO/IEC 42001

| Item Type | Item ID | Label | EU | NIST | ISO |
| --- | --- | --- | --- | --- | --- |
| controls | human_oversight_design | HITL/HOTL design with documented override/escalation | Art. 14 | Gov-4.2 | Cl. 9.3 |
| controls | incident_response | AI incident management (detection, triage, comms, postmortems) | Art. 62 | Mng-5 | Cl. 10.1 |
| controls | monitoring_bias_drift | Monitoring for bias/drift/robustness with thresholds & alerts | Art. 15 | Msr-2.4 | Cl. 9.1 |
| controls | third_party_validation | External audit or conformity assessment completed | Art. 17 | Gov-5.3 | Cl. 9.2 |
| controls | policy_aimgov | Written AI policy + AIMS aligned to ISO 42001 (approved, reviewed annually) | Art. 4 | Gov-1.1 | Cl. 5.2 |
| controls | risk_register | Central AI risk register with owners, mitigations, review cadence | Art. 9 | Map-1 | Cl. 6.1 |
| controls | dpia_pia | DPIA/PIA conducted and updated for AI data processing | Art. 35 | Map-2 | Cl. 6.1 |
| controls | model_docs | Model cards/data sheets, versioning, lineage, decision logs | Art. 11 | Gov-2 | Cl. 7.5 |
| controls | security_mlsdlc | Secure MLOps/ML-SDLC incl. adversarial testing & supply-chain checks | Art. 15 | Manage-1 | Cl. 8.1 |
| controls | monitoring_metrics | Monitoring metrics and dashboards for AI control performance | Art. 15 | Msr-2 | Cl. 9.1.1 |
| questions | risk_classification | Has the AI use-case been classified by risk level according to the EU AI Act and mapped for potential harms (legal, ethical, safety, privacy, security)? | Art. 6 | Map-1 | Cl. 8.2 |
| questions | docs_traceability | What documentation exists: versioning, training data provenance, model governance, decision logs, incident records, and conformity assessments? | Art. 11 | Gov-2 | Cl. 7.5 |
| questions | independent_validation | Have conformity assessments or external/third-party audits been conducted to validate controls and compliance? | Art. 17 | Gov-5 | Cl. 9.2 |
| questions | monitoring_metrics | What metrics and benchmarks are used to monitor accuracy, fairness, robustness, security, and ethical compliance? | Art. 15 | Msr-2 | Cl. 9.1.1 |
| questions | human_oversight | How is human oversight and intervention designed into the AI system, particularly for high-risk applications? | Art. 14 | Gov-4.2 | Cl. 9.3 |
| questions | audit_trails | Are processes in place for audit trails and record keeping to support regulatory reviews and internal accountability? | Art. 11 | Gov-2 | Cl. 7.5 |
| questions | leadership | How is top management involved in supporting, directing, and overseeing AI policies and risk controls? |  |  | Cl. 5.1 |
| questions | gov_policies | Is there a written AI governance policy and an AIMS aligned to ISO/IEC 42001? |  |  | Cl. 5.2 |

## Related Files

- [`cross_scenario_governance_output_comparison.md`](./cross_scenario_governance_output_comparison.md)
- [`gcs_comparison_table.tex`](./gcs_comparison_table.tex)
- [`regulation_crosswalk.csv`](./regulation_crosswalk.csv)
- [`regulation_crosswalk.json`](./regulation_crosswalk.json)
