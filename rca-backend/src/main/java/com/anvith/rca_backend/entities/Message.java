package com.anvith.rca_backend.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Message {

    public String sender;
    public String content;
    public LocalDateTime timeStamp;

    public Message(String sender, String content) {
        this.sender = sender;
        this.content = content;
        this.timeStamp = LocalDateTime.now();
    }

}
