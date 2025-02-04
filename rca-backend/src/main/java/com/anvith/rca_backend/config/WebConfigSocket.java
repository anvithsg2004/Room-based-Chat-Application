package com.anvith.rca_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebConfigSocket implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry config) {
        // "/chat": This is the endpoint URL where clients will connect.
        config.addEndpoint("/chat")
                //setAllowedOrigins("http://localhost:3000"):
                //From the frontend.
                // This allows connections only from http://localhost:3000 (usually your frontend application).
                .setAllowedOrigins("http://localhost:5173")
                //This enables SockJS fallback options, which means if WebSocket is not supported by the browser,
                // it will fall back to other methods like HTTP polling.
                .withSockJS();
    }

    //Concept
    //What is a Message Broker?
    //A message broker is like a post office.
    // It helps deliver messages (data) from one place (the server) to another (the clients).
    // In this case, it’s used for real-time communication between the server and the clients (like a chat app).

    //1) What does configureMessageBroker do?
    //This method sets up two things:
    //Where the server can send messages to clients:
    //config.enableSimpleBroker("/topic"):
    //This means the server can send messages to clients who are "listening" to topics that start with /topic.
    //For example, if a client subscribes to /topic/room/123,
    // the server can send messages to all clients listening to that topic.
    //Think of /topic as a channel or a group where messages are broadcast to everyone who joined that channel.

    //2) Where clients can send messages to the server:
    //config.setApplicationDestinationPrefixes("/app"):
    //This means when a client sends a message to the server, the message must start with /app.
    //For example, if a client sends a message to /app/sendMessage, the server will receive it and process it.
    //Think of /app as the "address" where clients send their messages to the server.
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        //Where the server can send messages to clients
        config.enableSimpleBroker("/topic");
        //Where clients can send messages to the server
        config.setApplicationDestinationPrefixes("/app");
    }
}
