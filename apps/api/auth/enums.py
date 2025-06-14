import enum
class UserRole(str,enum.Enum):
    ADMIN = "ADMIN" 
    USER = "USER"

    def __str__(self):
        return str(self.value)