package com.pomodorowork.domain;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class Tag {
    private String id;
    private String name;
    private long createdAt;

    public Tag() {
    }

    public Tag(String id, String name, long createdAt) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}
