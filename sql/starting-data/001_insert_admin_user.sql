INSERT INTO users (email, password, isVerified)
SELECT 'admin@admin.it', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZGHF4gh5r6h0D8y1Q9F6Qw1Yy8FZm', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@admin.it');
