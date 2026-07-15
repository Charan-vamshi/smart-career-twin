package com.smartcareertwin.smartcareertwin;

import com.smartcareertwin.smartcareertwin.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TestTokenGenerator implements CommandLineRunner {
    @Autowired
    private JwtUtils jwtUtils;
    
    @Override
    public void run(String... args) throws Exception {
        String token = jwtUtils.generateToken("test-google-id");
        System.out.println("TEST_TOKEN=" + token);
    }
}
