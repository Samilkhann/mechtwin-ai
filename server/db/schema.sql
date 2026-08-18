-- ============================================================
-- MECHTWIN AI — Relational PostgreSQL Database Schema
-- Tagline: "Engineering Intelligence for Every Machine."
-- Created & Engineered by Samil Khan
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations & Tenancy
CREATE TABLE organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(128) NOT NULL,
    site_location VARCHAR(255) NOT NULL,
    license_tier VARCHAR(64) DEFAULT 'Enterprise Industry 4.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Role-Based Access Control (RBAC)
CREATE TYPE user_role AS ENUM ('ADMIN', 'ENGINEER', 'VIEWER');

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'ENGINEER',
    department VARCHAR(128) NOT NULL,
    avatar_initials VARCHAR(8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Machines (Digital Twins)
CREATE TYPE machine_status AS ENUM ('NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE');

CREATE TABLE machines (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tag VARCHAR(64) UNIQUE NOT NULL,
    type VARCHAR(128) NOT NULL,
    manufacturer VARCHAR(128) NOT NULL,
    model VARCHAR(128) NOT NULL,
    serial_number VARCHAR(128) NOT NULL,
    location VARCHAR(255) NOT NULL,
    installation_date DATE NOT NULL,
    operating_hours DOUBLE PRECISION DEFAULT 0.0,
    status machine_status DEFAULT 'NORMAL',
    health_score DOUBLE PRECISION DEFAULT 100.0,
    rated_power_kw DOUBLE PRECISION NOT NULL,
    rated_rpm DOUBLE PRECISION NOT NULL,
    rated_voltage_v DOUBLE PRECISION NOT NULL,
    rated_current_a DOUBLE PRECISION NOT NULL,
    rated_pressure_bar DOUBLE PRECISION,
    rated_flow_lpm DOUBLE PRECISION,
    rated_head_meters DOUBLE PRECISION,
    mtbf_hours DOUBLE PRECISION DEFAULT 25000.0,
    energy_cost_per_kwh DOUBLE PRECISION DEFAULT 0.14,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Machine Sub-Assembly Components
CREATE TABLE machine_components (
    id VARCHAR(64) PRIMARY KEY,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    material VARCHAR(255) NOT NULL,
    operating_hours DOUBLE PRECISION DEFAULT 0.0,
    estimated_life_days INTEGER DEFAULT 365,
    risk_level VARCHAR(32) DEFAULT 'Low',
    last_inspected DATE,
    specifications JSONB DEFAULT '{}',
    position_3d JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sensors & Calibration Metadata
CREATE TYPE sensor_type AS ENUM (
    'temperature', 'vibration', 'rpm', 'current', 'voltage',
    'power', 'pressure_inlet', 'pressure_outlet', 'flow', 'torque', 'acoustic'
);
CREATE TYPE sensor_status AS ENUM ('ONLINE', 'WARNING', 'OFFLINE', 'CALIBRATING');
CREATE TYPE calibration_status AS ENUM ('CALIBRATED', 'DUE_SOON', 'EXPIRED');

CREATE TABLE sensors (
    id VARCHAR(64) PRIMARY KEY,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE CASCADE,
    component_id VARCHAR(64) REFERENCES machine_components(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type sensor_type NOT NULL,
    unit VARCHAR(32) NOT NULL,
    sampling_rate_hz DOUBLE PRECISION DEFAULT 10.0,
    status sensor_status DEFAULT 'ONLINE',
    calibration_status calibration_status DEFAULT 'CALIBRATED',
    min_safe DOUBLE PRECISION NOT NULL,
    max_safe DOUBLE PRECISION NOT NULL,
    min_warning DOUBLE PRECISION NOT NULL,
    max_warning DOUBLE PRECISION NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Time-Series Sensor Readings & Telemetry
CREATE TYPE reading_quality AS ENUM ('GOOD', 'WARNING', 'INVALID');
CREATE TYPE reading_source AS ENUM ('SIMULATED', 'LIVE_SENSOR', 'IMPORTED');
CREATE TYPE data_trust_level AS ENUM ('LIVE_SENSOR', 'SIMULATED', 'CALCULATED', 'ESTIMATED', 'PREDICTED', 'AI_ANALYSIS');

CREATE TABLE sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    sensor_id VARCHAR(64) REFERENCES sensors(id) ON DELETE CASCADE,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE CASCADE,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(32) NOT NULL,
    quality reading_quality DEFAULT 'GOOD',
    source reading_source DEFAULT 'SIMULATED',
    data_trust data_trust_level DEFAULT 'SIMULATED'
);

CREATE INDEX idx_sensor_readings_time ON sensor_readings (machine_id, sensor_id, timestamp DESC);

-- 7. Machine Operating Profiles
CREATE TABLE machine_operating_profiles (
    id VARCHAR(64) PRIMARY KEY,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE CASCADE,
    shift_name VARCHAR(64) NOT NULL,
    nominal_load_pct DOUBLE PRECISION DEFAULT 85.0,
    target_rpm DOUBLE PRECISION NOT NULL,
    cycle_duration_hours DOUBLE PRECISION DEFAULT 8.0,
    ambient_temp_c DOUBLE PRECISION DEFAULT 24.0,
    ambient_humidity_pct DOUBLE PRECISION DEFAULT 50.0
);

-- 8. Anomaly Events
CREATE TABLE anomaly_events (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE CASCADE,
    sensor_id VARCHAR(64) REFERENCES sensors(id) ON DELETE SET NULL,
    severity VARCHAR(32) NOT NULL,
    observed_value DOUBLE PRECISION NOT NULL,
    expected_min DOUBLE PRECISION NOT NULL,
    expected_max DOUBLE PRECISION NOT NULL,
    deviation_pct DOUBLE PRECISION NOT NULL,
    possible_cause TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    data_trust data_trust_level DEFAULT 'CALCULATED'
);

-- 9. Fault Predictions & RUL
CREATE TABLE fault_predictions (
    id VARCHAR(64) PRIMARY KEY,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE CASCADE,
    component_id VARCHAR(64) REFERENCES machine_components(id) ON DELETE SET NULL,
    fault_type VARCHAR(128) NOT NULL,
    probability DOUBLE PRECISION NOT NULL,
    severity VARCHAR(32) NOT NULL,
    evidence JSONB DEFAULT '[]',
    recommended_action TEXT NOT NULL,
    maintenance_priority VARCHAR(64) NOT NULL,
    estimated_time_to_failure_hours DOUBLE PRECISION,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    iso_standard_ref VARCHAR(128),
    data_trust data_trust_level DEFAULT 'PREDICTED'
);

-- 10. Maintenance Records & Work Orders
CREATE TABLE maintenance_records (
    id VARCHAR(64) PRIMARY KEY,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE CASCADE,
    component_id VARCHAR(64) REFERENCES machine_components(id) ON DELETE SET NULL,
    type VARCHAR(32) NOT NULL,
    issue VARCHAR(255) NOT NULL,
    priority VARCHAR(32) NOT NULL,
    assigned_engineer VARCHAR(255) NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completion_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) DEFAULT 'OPEN',
    estimated_hours DOUBLE PRECISION DEFAULT 2.0,
    actual_hours DOUBLE PRECISION,
    required_parts JSONB DEFAULT '[]',
    notes TEXT
);

-- 11. Alerts & Threshold Triggers
CREATE TABLE alerts (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE CASCADE,
    sensor_id VARCHAR(64) REFERENCES sensors(id) ON DELETE SET NULL,
    level VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    rule_trigger VARCHAR(128) NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE
);

-- 12. Engineering Calculations
CREATE TABLE engineering_calculations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    formula_latex TEXT NOT NULL,
    inputs JSONB NOT NULL,
    output_result DOUBLE PRECISION NOT NULL,
    output_unit VARCHAR(64) NOT NULL,
    steps JSONB DEFAULT '[]',
    substitution TEXT,
    interpretation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Simulation Runs & What-If Scenarios
CREATE TABLE simulation_runs (
    id VARCHAR(64) PRIMARY KEY,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    scenario_name VARCHAR(255) NOT NULL,
    inputs JSONB NOT NULL,
    baseline JSONB NOT NULL,
    predicted JSONB NOT NULL,
    deltas JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. AI Conversations & Contextual Messages
CREATE TABLE ai_conversations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(32) NOT NULL,
    text TEXT NOT NULL,
    structured_analysis JSONB,
    recommendations JSONB DEFAULT '[]',
    evidence JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Compliance Reports
CREATE TABLE reports (
    id VARCHAR(64) PRIMARY KEY,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    standard_ref VARCHAR(128) NOT NULL,
    overall_health DOUBLE PRECISION NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'SUCCESS',
    ip_address VARCHAR(64) NOT NULL
);
