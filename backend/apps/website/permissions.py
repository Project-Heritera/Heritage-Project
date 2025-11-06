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


def user_has_access(container, user, *, edit=False, _visited=None):
    """
    Determine if a user can view or edit a Course, Section, or Room.

    Access rules:
    - PUBLIC: anyone can view; only creator/staff can edit.
    - PRIVATE: only users listed in access table can view.
        * VISITOR: view-only
        * EDITOR: can edit
    - Access checks cascade down hierarchy:
        Room → Section → Course

    @param container: Course, Section, or Room instance.
    @param user: The user performing the request.
    @param edit: True if edit permissions are required.
    @return: True if access is allowed; otherwise False.
    """
    # --- Base auth ---
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff or user == getattr(container, "creator", None):
        return True

    # --- Recursion guard ---
    if _visited is None:
        _visited = set()
    if id(container) in _visited:
        return False
    _visited.add(id(container))

    # --- Parent hierarchy check ---
    parent = getattr(container, "section", None) or getattr(container, "course", None)
    if parent and not user_has_access(parent, user, edit=False, _visited=_visited):
        return False

    # --- Determine access model and visibility ---
    mapping = CONTAINER_ACCESS_MAP.get(container.__class__)
    if not mapping:
        return False

    AccessModel, id_field_name = mapping
    visibility = getattr(container, "visibility", VisibilityLevel.PRIVATE)
    container_id = container.id

    # --- PUBLIC ---
    if visibility == VisibilityLevel.PUBLIC:
        # Anyone can view; only staff/creator can edit
        return not edit

    # --- PRIVATE ---
    access_filter = {"user": user, id_field_name: container_id}
    user_access = AccessModel.objects.filter(**access_filter).first()
    access_level = getattr(user_access, "access_level", None)

    if not user_access:
        return False

    # VISITOR: view-only; EDITOR: can edit
    return not edit or access_level == AccessLevel.EDITOR
