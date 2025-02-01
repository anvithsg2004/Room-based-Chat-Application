package com.anvith.rca_backend.repositories;

import com.anvith.rca_backend.entities.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room, String> {

    //Get the room using the Room ID.
    Room findByRoomId(String roomId);

}
