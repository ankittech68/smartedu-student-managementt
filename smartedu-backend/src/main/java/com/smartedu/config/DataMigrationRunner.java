package com.smartedu.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataMigrationRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Update any existing null approval_status columns to 'APPROVED'
        try {
            jdbcTemplate.execute("UPDATE attendance SET approval_status = 'APPROVED' WHERE approval_status IS NULL");
            jdbcTemplate.execute("UPDATE marks SET approval_status = 'APPROVED' WHERE approval_status IS NULL");
            System.out.println("DataMigrationRunner: Successfully migrated null approval statuses to APPROVED.");
        } catch (Exception e) {
            System.out.println("DataMigrationRunner: Migration failed or columns don't exist yet: " + e.getMessage());
        }
    }
}
