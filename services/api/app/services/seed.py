"""Seed Sprint 0 database with mock data matching the frontend mock."""
import uuid
from datetime import datetime, timezone
from app.database import get_conn
from app.services.audit_logger import log_event


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


PROJECTS = [
    ("P75",  "PAAB Machang Water Treatment", "JPS Kelantan",  "red",   "Water treatment plant upgrade — Stage 2 civil works",                     "2026-06-17"),
    ("P89B", "Jalan Semantan Upgrading",      "JKR Putrajaya", "amber", "Road upgrading Package B — drainage and pavement works",                  "2026-06-18"),
    ("SSP2", "SSP2 Design Package",           "Prasarana",     "amber", "Subang-Shah Alam Paramedic LRT — civil and structural design",            "2026-06-20"),
    ("M12",  "Miri Airport Expansion",        "MAHB",          "blue",  "Terminal expansion — geotechnical assessment phase",                       None),
    ("INT",  "Internal / Admin",              "DPI",           "green", "Internal ops, staff, tools, templates",                                    None),
]

ACTIONS = [
    {
        "id": "a1", "project_code": "P75",
        "title": "EOT Claim — JPS requests 45-day extension on Stage 2 civil works",
        "risk_level": "red", "action_type": "EOT / Claim",
        "status": "pending-review", "priority": 1, "due_date": "2026-06-16",
        "next_step": "Desktop review required — prepare EOT response with programme evidence",
        "authority_text": "RED · Desktop Review Required · Contractual / Claim Risk",
        "ai_generated": True,
        "summary": "JPS has submitted a formal 45-day EOT request citing unforeseen ground conditions at Chainage 2+450.",
        "ai_reason": "Classified RED due to contractual / claims risk. EOT claims require engineering programme analysis and legal review before any response.",
        "sources": [
            ("Gmail", "JPS EOT Notice 14/6", "2026-06-14", True),
            ("Attachment", "EOT_Request_P75_Stage2.pdf", "2026-06-14", False),
        ],
        "missing": ["Original baseline programme not found in Drive", "Site supervisor daily reports for June not uploaded"],
    },
    {
        "id": "a2", "project_code": "P89B",
        "title": "Progress Claim No. 8 — JKR Review Pending",
        "risk_level": "amber", "action_type": "Progress Claim",
        "status": "in-review", "priority": 2, "due_date": "2026-06-18",
        "next_step": "Complete measurement verification and prepare technical review note",
        "authority_text": "AMBER · Technical Review · Measurement and Certification",
        "ai_generated": True,
        "summary": "Progress Claim No. 8 covering earthworks and drainage Zones 3–6. JKR requires DPI sign-off by 18 June.",
        "ai_reason": "Classified AMBER — measurement review required before certification. No contractual dispute signal found.",
        "sources": [
            ("Gmail", "PC8 Submission Cover Email", "2026-06-12", True),
            ("Drive", "PC8_Measurement_Sheet_R0.xlsx", "2026-06-12", False),
        ],
        "missing": ["Zone 5 as-built drawings not attached"],
    },
    {
        "id": "a3", "project_code": "SSP2",
        "title": "Design Submission — Viaduct Pier Foundation IFC drawings for PAAB approval",
        "risk_level": "amber", "action_type": "Technical Submission",
        "status": "pending-approval", "priority": 2, "due_date": "2026-06-20",
        "next_step": "Confirm submission checklist complete, obtain DPI director signature",
        "authority_text": "AMBER · Director Approval Required · IFC Technical Submission",
        "ai_generated": True,
        "summary": "Issued-for-Construction pier foundation drawings require formal DPI director sign-off before Prasarana submission portal upload.",
        "ai_reason": "Classified AMBER — IFC submission to client. Requires internal approval gate.",
        "sources": [
            ("Drive", "SSP2-CIV-FND-DWG-001_IFC_R0.pdf", "2026-06-10", True),
            ("Gmail", "Prasarana submission portal email", "2026-06-11", False),
        ],
        "missing": [],
    },
    {
        "id": "a4", "project_code": "P75",
        "title": "HIRARC Update — Confined space works at pump station",
        "risk_level": "red", "action_type": "HIRARC / Safety",
        "status": "pending-review", "priority": 1, "due_date": "2026-06-15",
        "next_step": "Update HIRARC for confined space and obtain SHO countersignature TODAY",
        "authority_text": "RED · SHO Countersignature Required · Safety / Regulatory",
        "ai_generated": True,
        "summary": "DOSH requires updated HIRARC for confined space pump station works. Current version does not cover gas monitoring procedure.",
        "ai_reason": "Classified RED — regulatory HIRARC requirement with same-day deadline.",
        "sources": [
            ("Gmail", "DOSH requirement notice", "2026-06-13", True),
            ("Local File", "HIRARC_P75_PumpStation_v1.docx", "2026-06-08", False),
        ],
        "missing": ["SHO contact not in system — check parties register"],
    },
    {
        "id": "a5", "project_code": "P89B",
        "title": "Meeting Prep — JKR monthly site meeting 18 June",
        "risk_level": "blue", "action_type": "Meeting Brief",
        "status": "pending-review", "priority": 3, "due_date": "2026-06-17",
        "next_step": "Prepare meeting brief with progress summary and open issues list",
        "authority_text": "BLUE · Routine Action · Meeting Preparation",
        "ai_generated": True,
        "summary": "Monthly JKR P89B site meeting on 18 June. DPI to present progress, open issues, and claim status.",
        "ai_reason": "Classified BLUE — routine meeting preparation. No contractual risk signals.",
        "sources": [("Calendar", "JKR Site Meeting 18/6 @ 10:00", "2026-06-18", True)],
        "missing": [],
    },
    {
        "id": "a6", "project_code": "M12",
        "title": "Geotech Report Acknowledgement — MAHB awaiting response",
        "risk_level": "blue", "action_type": "Acknowledgement",
        "status": "pending-review", "priority": 3, "due_date": "2026-06-16",
        "next_step": "Draft formal acknowledgement of geotechnical report receipt",
        "authority_text": "BLUE · Routine Action · Correspondence",
        "ai_generated": True,
        "summary": "MAHB sent M12 geotechnical investigation report. Awaiting DPI formal acknowledgement email.",
        "ai_reason": "Classified BLUE — routine acknowledgement. No risk signals.",
        "sources": [("Gmail", "MAHB M12 Report Delivery Email", "2026-06-13", True)],
        "missing": [],
    },
    {
        "id": "a7", "project_code": "INT",
        "title": "Staff timesheet system — July cutoff configuration",
        "risk_level": "green", "action_type": "Internal Admin",
        "status": "pending-review", "priority": 4, "due_date": "2026-06-30",
        "next_step": "Update timesheet cutoff dates in HR system for July 2026",
        "authority_text": "GREEN · Internal / Safe · Admin",
        "ai_generated": False,
        "summary": "Internal admin task — configure July cutoff in HR system before month end.",
        "ai_reason": "Classified GREEN — internal administrative task with no external or contractual impact.",
        "sources": [("Manual Note", "Admin note — 15 June", "2026-06-15", True)],
        "missing": [],
    },
]

APPROVALS = [
    {
        "id": "ap1", "action_id": "a3", "project_code": "SSP2",
        "proposed_action": "Upload SSP2-CIV-FND-DWG-001 IFC drawings to Prasarana CDE submission portal",
        "consequence": "Submission becomes official record. Cannot be recalled once uploaded.",
        "risk_level": "amber", "allowed_mode": "desktop-only", "status": "pending",
        "requested_at": "2026-06-15T08:00:00+00:00",
    },
    {
        "id": "ap2", "action_id": "a1", "project_code": "P75",
        "proposed_action": "Send formal EOT response letter to JPS Kelantan",
        "consequence": "Contractual position is committed. Legal review recommended before sending.",
        "risk_level": "red", "allowed_mode": "desktop-only", "status": "pending",
        "requested_at": "2026-06-14T16:00:00+00:00",
    },
]

AUDIT = [
    ("ev1", "2026-06-15T09:30:00+00:00", "Email classified",    "inbox-agent",          "P75",  "a1", "JPS EOT Notice email classified as EOT/Claim · Risk: RED",                "Gmail"),
    ("ev2", "2026-06-15T09:30:05+00:00", "Action card created", "task-compiler-agent",  "P75",  "a1", "Action card a1 created from email ev1 — pending review",                   None),
    ("ev3", "2026-06-15T09:31:00+00:00", "Phone notification",  "notification-agent",   "P75",  None, "ntfy RED alert sent — P75 EOT Claim — desktop review required",            None),
    ("ev4", "2026-06-15T08:00:00+00:00", "Approval requested",  "approval-agent",       "SSP2", "a3", "Approval gate opened for SSP2 IFC drawing upload",                         None),
    ("ev5", "2026-06-14T16:45:00+00:00", "Email classified",    "inbox-agent",          "SSP2", None, "Prasarana submission portal email classified as Technical Submission · Risk: AMBER", "Gmail"),
    ("ev6", "2026-06-14T16:00:00+00:00", "Approval requested",  "approval-agent",       "P75",  "a1", "Approval gate opened for EOT response letter",                              None),
    ("ev7", "2026-06-13T11:20:00+00:00", "Email classified",    "inbox-agent",          "M12",  None, "MAHB report delivery email classified as Acknowledgement · Risk: BLUE",    "Gmail"),
]


def seed_db() -> None:
    with get_conn() as conn:
        # Skip if already seeded
        if conn.execute("SELECT COUNT(*) FROM projects").fetchone()[0] > 0:
            return

        for code, name, client, risk, desc, mtg in PROJECTS:
            conn.execute(
                "INSERT OR IGNORE INTO projects (code, name, client, risk_level, description, next_meeting) VALUES (?,?,?,?,?,?)",
                (code, name, client, risk, desc, mtg),
            )

        for a in ACTIONS:
            conn.execute(
                """INSERT OR IGNORE INTO action_cards
                   (id, project_code, title, risk_level, action_type, status, priority,
                    due_date, next_step, authority_text, ai_generated, summary, ai_reason)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (a["id"], a["project_code"], a["title"], a["risk_level"], a["action_type"],
                 a["status"], a["priority"], a["due_date"], a["next_step"], a["authority_text"],
                 a["ai_generated"], a["summary"], a["ai_reason"]),
            )
            for i, (stype, label, sdate, primary) in enumerate(a["sources"]):
                conn.execute(
                    "INSERT INTO source_items (action_id, source_type, label, item_date, is_primary, sort_order) VALUES (?,?,?,?,?,?)",
                    (a["id"], stype, label, sdate, primary, i),
                )
            for i, m in enumerate(a["missing"]):
                conn.execute(
                    "INSERT INTO missing_info (action_id, description, sort_order) VALUES (?,?,?)",
                    (a["id"], m, i),
                )

        for ap in APPROVALS:
            conn.execute(
                """INSERT OR IGNORE INTO approval_items
                   (id, action_id, project_code, proposed_action, consequence, risk_level, allowed_mode, status, requested_at)
                   VALUES (?,?,?,?,?,?,?,?,?)""",
                (ap["id"], ap["action_id"], ap["project_code"], ap["proposed_action"],
                 ap["consequence"], ap["risk_level"], ap["allowed_mode"], ap["status"], ap["requested_at"]),
            )

        for ev_id, ts, event, actor, proj, act_id, detail, source in AUDIT:
            conn.execute(
                "INSERT OR IGNORE INTO audit_events (id, timestamp, event, actor, project_code, action_id, detail, source) VALUES (?,?,?,?,?,?,?,?)",
                (ev_id, ts, event, actor, proj, act_id, detail, source),
            )
