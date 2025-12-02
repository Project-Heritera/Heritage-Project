from .models import (
    Room,
    Course,
    Section,
    UserCourseAccessLevel,
    UserSectionAccessLevel,
    UserRoomAccessLevel,
    VisibilityLevel,
    AccessLevel,
)

# Maps a container model to its corresponding access model and ID field name
CONTAINER_ACCESS_MAP = {
    Course: (UserCourseAccessLevel, "course_id"),
    Section: (UserSectionAccessLevel, "section_id"),
    Room: (UserRoomAccessLevel, "room_id"),
}

def _get_access_precedence(level):
    """Returns an integer precedence for AccessLevel for comparison."""
    if level == AccessLevel.EDITOR:
        return 2
    if level == AccessLevel.VISITOR:
        return 1
    return 0 # No access

def get_effective_access_level(container, user, _visited=None):
    """
    Recursively determines the highest effective AccessLevel a user has for a
    container by checking the container itself and its parent hierarchy.

    Returns:
        AccessLevel (EDITOR, VISITOR), or None if no access.
    """
    # --- Base auth (Highest Access) ---
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser or user.is_staff or user == getattr(container, "creator", None):
        return AccessLevel.EDITOR

    # --- Recursion guard ---
    if _visited is None:
        _visited = set()
    if id(container) in _visited:
        return None
    _visited.add(id(container))

    # --- 1. Determine local access level and visibility ---
    mapping = CONTAINER_ACCESS_MAP.get(container.__class__)
    if not mapping:
        return None

    AccessModel, id_field_name = mapping
    visibility = getattr(container, "visibility", VisibilityLevel.PRIVATE)
    container_id = container.id
    highest_access = None

    # --- PUBLIC ---
    if visibility == VisibilityLevel.PUBLIC:
        # Staff/creator already covered in Base Auth. Anyone else gets VIEW access.
        highest_access = AccessLevel.VISITOR
    # --- PRIVATE ---
    else:
        access_filter = {"user": user, id_field_name: container_id}
        user_access = AccessModel.objects.filter(**access_filter).first()
        if user_access:
            highest_access = user_access.access_level

    # --- 2. Parent hierarchy check (Recursion) ---
    parent = getattr(container, "section", None) or getattr(container, "course", None)
    if parent:
        parent_access = get_effective_access_level(parent, user, _visited=_visited)

        # Compare and take the highest access level from the hierarchy
        if parent_access:
            if highest_access is None or _get_access_precedence(parent_access) > _get_access_precedence(highest_access):
                highest_access = parent_access

    return highest_access


def user_has_access(container, user, *, edit=False):
    """
    Determine if a user can view or edit a container, factoring in inherited access.

    @param container: Course, Section, or Room instance.
    @param user: The user performing the request.
    @param edit: True if edit permissions are required.
    @return: True if access is allowed; otherwise False.
    """
    effective_access = get_effective_access_level(container, user)

    if effective_access is None:
        return False
    
    # Required access level (view requires VISITOR, edit requires EDITOR)
    required_precedence = _get_access_precedence(AccessLevel.EDITOR) if edit else _get_access_precedence(AccessLevel.VISITOR)
    
    # Check if the user's effective access is high enough
    return _get_access_precedence(effective_access) >= required_precedence