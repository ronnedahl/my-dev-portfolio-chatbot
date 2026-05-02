"""Clear all documents from the Firebase vector store knowledge base."""

import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from src.services.firebase_vector_store import FirebaseVectorStore
from src.config import settings
import structlog

logger = structlog.get_logger()


async def clear_knowledge_base():
    """Delete every document in the configured Firebase collection."""

    store = FirebaseVectorStore()
    collection = store.firebase.get_collection(store.collection_name)

    documents = list(collection.stream())
    total = len(documents)

    if total == 0:
        logger.info("Knowledge base is already empty.")
        return

    print(
        f"\n⚠️  About to delete {total} documents from collection "
        f"'{store.collection_name}' in project '{settings.firebase_project_id}'."
    )
    confirmation = input("Type 'DELETE' to confirm: ").strip()

    if confirmation != "DELETE":
        print("Aborted. No documents were deleted.")
        return

    deleted = 0
    failed = 0
    for doc in documents:
        try:
            collection.document(doc.id).delete()
            deleted += 1
            logger.info(f"Deleted document {deleted}/{total}: {doc.id}")
        except Exception as e:
            failed += 1
            logger.error(f"Failed to delete document {doc.id}: {e}")

    logger.info(
        f"Clear completed. Deleted: {deleted}, Failed: {failed}, Total: {total}"
    )


if __name__ == "__main__":
    asyncio.run(clear_knowledge_base())
