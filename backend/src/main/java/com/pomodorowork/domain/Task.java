package com.pomodorowork.domain;

import io.micronaut.serde.annotation.Serdeable;
import java.util.List;

@Serdeable
public class Task {
    private String id;
    private String title;
    private String description;
    private String projectId;
    private List<String> tagIds;
    private int completedPomodoros;
    private long createdAt;

    public Task() {
    }

    public Task(String id, String title, String description, String projectId, List<String> tagIds, int completedPomodoros, long createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.projectId = projectId;
        this.tagIds = tagIds;
        this.completedPomodoros = completedPomodoros;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public List<String> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<String> tagIds) {
        this.tagIds = tagIds;
    }

    public int getCompletedPomodoros() {
        return completedPomodoros;
    }

    public void setCompletedPomodoros(int completedPomodoros) {
        this.completedPomodoros = completedPomodoros;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}
