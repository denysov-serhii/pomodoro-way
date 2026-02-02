package com.pomodorowork.controller;

import com.pomodorowork.domain.Tag;
import io.micronaut.http.annotation.*;
import jakarta.inject.Singleton;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller("/api/tags")
@Singleton
public class TagController {

    private final Map<String, Tag> tags = new ConcurrentHashMap<>();

    @Get
    public List<Tag> list() {
        return new ArrayList<>(tags.values());
    }

    @Get("/{id}")
    public Optional<Tag> get(String id) {
        return Optional.ofNullable(tags.get(id));
    }

    @Post
    public Tag create(@Body Tag tag) {
        if (tag.getId() == null || tag.getId().isEmpty()) {
            tag.setId(UUID.randomUUID().toString());
        }
        if (tag.getCreatedAt() == 0) {
            tag.setCreatedAt(System.currentTimeMillis());
        }
        tags.put(tag.getId(), tag);
        return tag;
    }

    @Put("/{id}")
    public Optional<Tag> update(String id, @Body Tag tag) {
        if (!tags.containsKey(id)) {
            return Optional.empty();
        }
        tag.setId(id);
        tags.put(id, tag);
        return Optional.of(tag);
    }

    @Delete("/{id}")
    public boolean delete(String id) {
        return tags.remove(id) != null;
    }
}
