package com.pomodorowork.controller;

import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;

import java.util.HashMap;
import java.util.Map;

@Controller("/api")
public class HealthController {

    @Get("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Pomodoro Way Backend");
        response.put("version", "0.1");
        return response;
    }
}
