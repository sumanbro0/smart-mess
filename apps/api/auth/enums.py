from enum import Enum

class UserRole(str,Enum):
    OWNER = "owner"
    STAFF = "staff"
    CUSTOMER = "customer"
    ADMIN = "admin"

    def __str__(self):
        return str(self.value)