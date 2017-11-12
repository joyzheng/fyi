import bottle
from collections import defaultdict

import db


def add(app):
    @app.route("/api/books", method="POST")
    def books():
        session = db.Session()
        category_counts = defaultdict(lambda: 0)
        try:
            ancestors = db.Category.ancestors(session)

            books = db.query_books(
                session,
                bottle.request.json["tags"],
                bottle.request.json["categories"],
            )

            current = []
            other = []
            for book in books:
                if (book.finished_at is None and
                        db.tags.Unfinished not in book.tags):
                    current.append(book.json())
                else:
                    other.append(book.json())

                all_ancestors = set()
                for category in book.categories:
                    all_ancestors.update(ancestors[category.name])
                for ancestor in all_ancestors:
                    category_counts[ancestor] += 1

            all_children = db.Category.children(session)

            def populate_children(parent, categories):
                children = [
                    {
                        "name": category,
                        "parent": parent,
                        "attributes": {},
                        "children": populate_children(
                            category,
                            all_children[category],
                        ),
                    }
                    for category in categories
                    if category_counts[category] > 0
                ]
                children.sort(key=lambda child: child["name"])
                return children

            top_node = {
                "name": "Books",
                "parent": None,
                "attributes": {},
                "children": populate_children(
                    "Books",
                    all_children["Books"],
                ),
            }

        finally:
            session.close()
        return {
            "current": current,
            "other": other,
            "categories": [top_node],
        }
