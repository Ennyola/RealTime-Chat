def get_room_name(room_name: str, username: str) -> str:
    """
    get room name which is the name of
    the person you're chatting with
    """

    if room_name.startswith(username):
        return room_name.split("-")[1]
    else:
        return room_name.split("-")[0]
    
