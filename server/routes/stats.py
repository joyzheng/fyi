from datetime import datetime, timedelta
import itertools

import bottle

import db


def add(app):

    @app.route("/api/stats", method="POST")
    def stats():
        date_format, bucket_values = get_bounds(
            bottle.request.json["group"])

        keys = list(itertools.chain(*[series["keys"] for series in SERIES]))
        bucket_keys = {key: 0 for key in keys}

        buckets = [{
            "name": bucket.strftime(date_format),
        } for bucket in bucket_values[:-1]]
        for bucket in buckets:
            bucket.update(bucket_keys)

        session = db.Session()
        try:
            books = db.query_books(session, [], [])
            for book in books:
                update_stats(bucket_values, buckets, book)
        finally:
            session.close()

        return {
            "series": SERIES,
            "data": buckets,
        }


SERIES = [
    {
        "group": "By Date",
        "name": "Completed",
        "labels": ["Completed"],
        "fill": ["#007700"],
        "keys": ["finished"],
    },
    {
        "group": "By Date",
        "name": "Started",
        "labels": ["Completed", "Abandoned", "In Progress"],
        "fill": ["#007700", "#a52121", "#999999"],
        "keys": ["start_finished", "start_abandoned",
                 "start_inprogress"],
    },
    {
        "group": "By Author",
        "name": "Gender",
        "labels": ["F", "M", "NB", "n/a"],
        "fill": ["#004c8c", "#008cff", "#9dcff9", "#999999"],
        "keys": ["gender_F", "gender_M", "gender_NB", "gender_NA"],
    },
    {
        "group": "By Author",
        "name": "POC",
        "labels": ["POC", "Non-POC"],
        "fill": ["#004c8c", "#008cff"],
        "keys": ["poc_Y", "poc_N"],
    },
    {
        "group": "By Book",
        "name": "Format",
        "labels": ["Ebook", "Paper", "Audiobook"],
        "fill": ["#a52121", "#a55e1f", "#a58e1d"],
        "keys": ["form_ebook", "form_paper", "form_audiobook"],
    },
    {
        "group": "By Book",
        "name": "Published",
        "labels": ["<1900", "1900-1949", "1950-1989",
                   "1990s", "2000s", "2010s"],
        "fill": ["#a52121", "#a53d20", "#a55e1f",
                 "#a5761e", "#a58e1d", "#a0a51d"],
        "keys": ["published_1800", "published_1900", "published_1950",
                 "published_1990", "published_2000", "published_2010"],
    },
    {
        "group": "By Book",
        "name": "Length",
        "labels": ["<200", "200-250", "250-300",
                   "300-350", "350-400", "400+"],
        "fill": ["#a0a51d", "#a58e1d", "#a5761e",
                 "#a55e1f", "#a53d20", "#a52121"],
        "keys": ["length_100", "length_200", "length_250",
                 "length_300", "length_350", "length_400"],
    },
]


def update_stats(bucket_values, buckets, book):
    it = zip(bucket_values, bucket_values[1:], buckets)
    for lower, upper, bucket in it:
        if book.finished_at and lower <= book.finished_at < upper:
            bucket["finished"] += 1
            bucket["form_" + book.form] += 1
            for author in book.authors:
                weight = 1 / len(book.authors)
                bucket["gender_" + author.gender] += weight
                if author.poc:
                    bucket["poc_Y"] += weight
                else:
                    bucket["poc_N"] += weight

            if book.published < 1900:
                bucket["published_1800"] += 1
            elif book.published < 1950:
                bucket["published_1990"] += 1
            elif book.published < 1990:
                bucket["published_1950"] += 1
            elif book.published < 2000:
                bucket["published_1990"] += 1
            elif book.published < 2010:
                bucket["published_2000"] += 1
            else:
                bucket["published_2010"] += 1

            if book.pages < 200:
                bucket["length_100"] += 1
            elif book.pages < 250:
                bucket["length_200"] += 1
            elif book.pages < 300:
                bucket["length_250"] += 1
            elif book.pages < 350:
                bucket["length_300"] += 1
            elif book.pages < 400:
                bucket["length_350"] += 1
            else:
                bucket["length_400"] += 1

        if book.started_at and lower <= book.started_at < upper:
            if book.finished_at:
                bucket["start_finished"] += 1
            elif any(tag.name == "Abandoned" for tag in book.tags):
                bucket["start_abandoned"] += 1
            else:
                bucket["start_inprogress"] += 1


def get_bounds(group_by):
    now = datetime.today()
    if group_by == "week":
        date_format = "%d %b"
        end = now + timedelta(days=(7 - now.weekday()))
        return date_format, [
            end - (26 - i) * timedelta(days=7)
            for i in range(27)
        ]
    elif group_by == "month":
        date_format = "%b %y"
        return date_format, [
            datetime(now.year + (now.month - i) // 12,
                     1 + ((12 + (now.month - i % 12)) % 12),
                     1)
            for i in range(12, -1, -1)
        ]
    elif group_by == "year":
        date_format = "%Y"
        return date_format, [
            datetime(year, 1, 1)
            for year in range(2008, now.year + 2)
        ]
    else:
        raise bottle.HttpError(status=400)
