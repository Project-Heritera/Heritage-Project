from django.db import migrations


def rebuild_progressoftask(apps, schema_editor):
    """Rebuild the `website_progressoftask` table to remove stray columns.

    This migration is intended for SQLite where `ALTER TABLE DROP COLUMN`
    may not be available. It creates a new table with the expected columns
    (based on the current models/migration), copies existing data for the
    matching columns, drops the old table, and renames the new one.
    """
    conn = schema_editor.connection
    vendor = conn.vendor
    cursor = conn.cursor()

    if vendor != "sqlite":
        # For non-SQLite DBs prefer simpler ALTER statements handled elsewhere.
        return

    # Create the new table without `score` and `last_attempt` columns.
    # Column types chosen to be compatible with Django's SQLite storage.
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS website_progressoftask_new (
        id INTEGER PRIMARY KEY,
        status VARCHAR(50) NOT NULL DEFAULT 'NOSTAR',
        attempts INTEGER NOT NULL,
        metadata TEXT,
        user_id INTEGER,
        task_id INTEGER
    );
    """
    )

    # Copy data from the old table for columns that exist in both tables.
    # Use COALESCE to provide defaults for missing columns if necessary.
    try:
        cursor.execute(
            "INSERT INTO website_progressoftask_new (id, status, attempts, metadata, user_id, task_id) "
            "SELECT id, status, attempts, metadata, user_id, task_id FROM website_progressoftask;"
        )
    except Exception:
        # If the SELECT fails (e.g., table doesn't exist), skip copy.
        try:
            conn.rollback()
        except Exception:
            pass
        return

    # Drop the old table and rename the new one.
    cursor.execute("DROP TABLE website_progressoftask;")
    cursor.execute(
        "ALTER TABLE website_progressoftask_new RENAME TO website_progressoftask;"
    )


def reverse_rebuild(apps, schema_editor):
    # Reverse is a no-op — restoring dropped columns requires data we don't have.
    return


class Migration(migrations.Migration):

    dependencies = [
        ("website", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(rebuild_progressoftask, reverse_code=reverse_rebuild),
    ]
