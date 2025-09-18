-- Truck Management System Table for VW TM System
-- Table name: vwtm_truck_management

CREATE TABLE IF NOT EXISTS vwtm_truck_management (
    id SERIAL PRIMARY KEY,
    departure_date DATE NOT NULL,
    departure_time VARCHAR(5) NOT NULL, -- Format: HH:MM (07:00, 08:00, etc.)
    delivery_no VARCHAR(100) NOT NULL,
    destination VARCHAR(50) NOT NULL CHECK (destination IN ('KMX', 'VX US', 'VW MX')),
    truck_id VARCHAR(100) NOT NULL,
    forza_id VARCHAR(100) NOT NULL,
    parts TEXT NOT NULL, -- Store parts information like "PartA(5) + PartB(3)"
    pager_no VARCHAR(50), -- Optional field
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'On Site', 'Shipped')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    notes TEXT -- Additional notes field
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_vwtm_truck_management_date ON vwtm_truck_management(departure_date);
CREATE INDEX IF NOT EXISTS idx_vwtm_truck_management_status ON vwtm_truck_management(status);
CREATE INDEX IF NOT EXISTS idx_vwtm_truck_management_destination ON vwtm_truck_management(destination);
CREATE INDEX IF NOT EXISTS idx_vwtm_truck_management_delivery_no ON vwtm_truck_management(delivery_no);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vwtm_truck_management_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vwtm_truck_management_updated_at 
    BEFORE UPDATE ON vwtm_truck_management 
    FOR EACH ROW 
    EXECUTE FUNCTION update_vwtm_truck_management_updated_at();

-- Insert sample data for testing
INSERT INTO vwtm_truck_management (
    departure_date, 
    departure_time, 
    delivery_no, 
    destination, 
    truck_id, 
    forza_id, 
    parts, 
    pager_no, 
    status
) VALUES 
    ('2024-01-15', '07:00', 'DEL-001', 'VW MX', 'TRUCK-001', 'FORZA-001', 'PartA(5) + PartB(3)', 'PAGER-001', 'Scheduled'),
    ('2024-01-15', '08:00', 'DEL-002', 'KMX', 'TRUCK-002', 'FORZA-002', 'PartC(2)', 'PAGER-002', 'On Site'),
    ('2024-01-15', '09:00', 'DEL-003', 'VX US', 'TRUCK-003', 'FORZA-003', 'PartD(4) + PartE(1)', NULL, 'Shipped'),
    ('2024-01-16', '07:00', 'DEL-004', 'VW MX', 'TRUCK-004', 'FORZA-004', 'PartF(3)', 'PAGER-004', 'Scheduled'),
    ('2024-01-16', '08:00', 'DEL-005', 'KMX', 'TRUCK-005', 'FORZA-005', 'PartG(2) + PartH(5)', NULL, 'On Site');

-- View for current truck status (last 30 days)
CREATE OR REPLACE VIEW vwtm_truck_status_view AS
SELECT 
    id,
    departure_date,
    departure_time,
    delivery_no,
    destination,
    truck_id,
    forza_id,
    parts,
    pager_no,
    status,
    created_at,
    updated_at,
    CASE 
        WHEN status = 'Scheduled' THEN '🕐'
        WHEN status = 'On Site' THEN '🚚'
        WHEN status = 'Shipped' THEN '✅'
    END as status_icon
FROM vwtm_truck_management 
WHERE departure_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY departure_date DESC, departure_time ASC;

-- Completion message
SELECT 'VW TM Truck Management table setup completed successfully!' as status;
