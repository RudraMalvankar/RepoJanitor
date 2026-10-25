import uuid
import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    path = Column(String(1024), nullable=False)
    url = Column(String(1024), nullable=True)
    current_branch = Column(String(255), default="main")
    is_demo = Column(Boolean, default=False)
    health_score = Column(Integer, default=100)
    health_breakdown = Column(Text, default="{}")  # JSON: documentation, quality, hygiene, tests, maintenance
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    scans = relationship("Scan", back_populates="repository", cascade="all, delete-orphan")
    actions = relationship("ProposedAction", back_populates="repository", cascade="all, delete-orphan")
    test_runs = relationship("TestRun", back_populates="repository", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="repository", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    repo_id = Column(String(36), ForeignKey("repositories.id"), nullable=False)
    status = Column(String(50), default="completed")  # running, completed, failed
    files_count = Column(Integer, default=0)
    lines_count = Column(Integer, default=0)
    duration_seconds = Column(Float, default=0.0)
    summary = Column(Text, default="{}")  # JSON summary counts
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    repository = relationship("Repository", back_populates="scans")
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=False)
    category = Column(String(50), nullable=False)  # duplicate, todo, dead_code, documentation, secret, code_quality, cleanup
    file_path = Column(String(1024), nullable=False)
    related_file_path = Column(String(1024), nullable=True)
    line_number = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    severity = Column(String(50), default="medium")  # low, medium, high, critical
    risk = Column(String(50), default="REVIEW")  # SAFE, REVIEW, BLOCKED
    evidence_json = Column(Text, default="[]")  # JSON list of strings
    is_ignored = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scan = relationship("Scan", back_populates="findings")
    proposed_actions = relationship("ProposedAction", back_populates="finding", cascade="all, delete-orphan")
    ai_analyses = relationship("AIAnalysis", back_populates="finding", cascade="all, delete-orphan")

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), nullable=False)
    finding_id = Column(String(36), ForeignKey("findings.id"), nullable=False)
    reasoning = Column(Text, nullable=False)
    evidence_json = Column(Text, default="[]")
    recommended_action = Column(String(100), nullable=True)
    confidence = Column(Float, default=0.85)
    model_name = Column(String(100), default="qwen2.5:7b")
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    finding = relationship("Finding", back_populates="ai_analyses")

class ProposedAction(Base):
    __tablename__ = "proposed_actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    repo_id = Column(String(36), ForeignKey("repositories.id"), nullable=False)
    finding_id = Column(String(36), ForeignKey("findings.id"), nullable=True)
    action_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    risk = Column(String(50), default="REVIEW")  # SAFE, REVIEW, BLOCKED
    requires_approval = Column(Boolean, default=True)
    status = Column(String(50), default="PENDING")  # PENDING, APPROVED, REJECTED, EXECUTED, FAILED
    details_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    repository = relationship("Repository", back_populates="actions")
    finding = relationship("Finding", back_populates="proposed_actions")
    executions = relationship("Execution", back_populates="action", cascade="all, delete-orphan")

class Execution(Base):
    __tablename__ = "executions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    action_id = Column(String(36), ForeignKey("proposed_actions.id"), nullable=False)
    status = Column(String(50), default="SUCCESS")  # SUCCESS, FAILED, ROLLED_BACK
    rollback_data_json = Column(Text, default="{}")
    error_message = Column(Text, nullable=True)
    stdout = Column(Text, nullable=True)
    stderr = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    action = relationship("ProposedAction", back_populates="executions")

class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    repo_id = Column(String(36), ForeignKey("repositories.id"), nullable=False)
    command = Column(String(255), nullable=False)
    passed = Column(Boolean, default=False)
    passed_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    skipped_count = Column(Integer, default=0)
    output = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    repository = relationship("Repository", back_populates="test_runs")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    repo_id = Column(String(36), ForeignKey("repositories.id"), nullable=False)
    event_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    details_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    repository = relationship("Repository", back_populates="audit_events")
