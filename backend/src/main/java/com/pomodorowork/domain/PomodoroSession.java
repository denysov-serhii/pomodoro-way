package com.pomodorowork.domain;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class PomodoroSession {
    private String id;
    private String taskId;
    private int duration;
    private long startedAt;
    private long completedAt;

    public PomodoroSession() {
    }

    public PomodoroSession(String id, String taskId, int duration, long startedAt, long completedAt) {
        this.id = id;
        this.taskId = taskId;
        this.duration = duration;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public long getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(long startedAt) {
        this.startedAt = startedAt;
    }

    public long getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(long completedAt) {
        this.completedAt = completedAt;
    }
}
