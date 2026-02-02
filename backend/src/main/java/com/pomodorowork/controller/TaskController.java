package com.pomodorowork.controller;

import com.pomodorowork.domain.Task;
import io.micronaut.http.annotation.*;
import jakarta.inject.Singleton;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller("/api/tasks")
@Singleton
public class TaskController {

    private final Map<String, Task> tasks = new ConcurrentHashMap<>();

    @Get
    public List<Task> list() {
        return new ArrayList<>(tasks.values());
    }

    @Get("/{id}")
    public Optional<Task> get(String id) {
        return Optional.ofNullable(tasks.get(id));
    }

    @Post
    public Task create(@Body Task task) {
        if (task.getId() == null || task.getId().isEmpty()) {
            task.setId(UUID.randomUUID().toString());
        }
        if (task.getCreatedAt() == 0) {
            task.setCreatedAt(System.currentTimeMillis());
        }
        tasks.put(task.getId(), task);
        return task;
    }

    @Put("/{id}")
    public Optional<Task> update(String id, @Body Task task) {
        if (!tasks.containsKey(id)) {
            return Optional.empty();
        }
        task.setId(id);
        tasks.put(id, task);
        return Optional.of(task);
    }

    @Delete("/{id}")
    public boolean delete(String id) {
        return tasks.remove(id) != null;
    }
}
