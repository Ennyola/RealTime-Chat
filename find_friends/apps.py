from django.apps import AppConfig


class FindFriendsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'find_friends'
    
    def ready(self):
        import find_friends.signals
