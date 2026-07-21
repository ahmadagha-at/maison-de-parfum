package com.parfumshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ParfumShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParfumShopApplication.class, args);
    }
}
