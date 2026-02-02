package com.pomodorowork.controller;

import com.pomodorowork.domain.Project;
import io.micronaut.http.annotation.*;
import jakarta.inject.Singleton;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller("/api/projects")
@Singleton
public class ProjectController {

    private final Map<String, Project> projects = new ConcurrentHashMap<>();

    @Get
    public List<Project> list() {
        return new ArrayList<>(projects.values());
    }

    @Get("/{id}")
    public Optional<Project> get(String id) {
        return Optional.ofNullable(projects.get(id));
    }

    @Post
    public Project create(@Body Project project) {
        if (project.getId() == null || project.getId().isEmpty()) {
            project.setId(UUID.randomUUID().toString());
        }
        if (project.getCreatedAt() == 0) {
            project.setCreatedAt(System.currentTimeMillis());
        }
        projects.put(project.getId(), project);
        return project;
    }

    @Put("/{id}")
    public Optional<Project> update(String id, @Body Project project) {
        if (!projects.containsKey(id)) {
            return Optional.empty();
        }
        project.setId(id);
        projects.put(id, project);
        return Optional.of(project);
    }

    @Delete("/{id}")
    public boolean delete(String id) {
        return projects.remove(id) != null;
    }
}
