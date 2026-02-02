package com.pomodorowork.controller;

import com.pomodorowork.domain.PomodoroSession;
import io.micronaut.http.annotation.*;
import jakarta.inject.Singleton;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Controller("/api/pomodoros")
@Singleton
public class PomodoroController {

    private final Map<String, PomodoroSession> sessions = new ConcurrentHashMap<>();

    @Get
    public List<PomodoroSession> list(@QueryValue(required = false) String taskId) {
        if (taskId != null && !taskId.isEmpty()) {
            return sessions.values().stream()
                    .filter(s -> taskId.equals(s.getTaskId()))
                    .collect(Collectors.toList());
        }
        return new ArrayList<>(sessions.values());
    }

    @Get("/{id}")
    public Optional<PomodoroSession> get(String id) {
        return Optional.ofNullable(sessions.get(id));
    }

    @Post
    public PomodoroSession create(@Body PomodoroSession session) {
        if (session.getId() == null || session.getId().isEmpty()) {
            session.setId(UUID.randomUUID().toString());
        }
        if (session.getStartedAt() == 0) {
            session.setStartedAt(System.currentTimeMillis());
        }
        sessions.put(session.getId(), session);
        return session;
    }

    @Put("/{id}")
    public Optional<PomodoroSession> update(String id, @Body PomodoroSession session) {
        if (!sessions.containsKey(id)) {
            return Optional.empty();
        }
        session.setId(id);
        sessions.put(id, session);
        return Optional.of(session);
    }

    @Delete("/{id}")
    public boolean delete(String id) {
        return sessions.remove(id) != null;
    }
}
