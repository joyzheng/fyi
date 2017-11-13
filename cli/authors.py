from db import Author

from cli.utils import (
    prompt,
    prompt_bool,
    prompt_options,
)


def get_or_create_author(session, first, last):
    authors = session.query(Author).filter(
        Author.first == first, last == Author.last).all()
    if len(authors) == 0:
        author = Author(first=first, last=last)
        session.add(author)
    elif len(authors) == 1:
        if prompt_bool('Author {} {} found, reuse?'.format(
                first, last)):
            return authors[0]
        else:
            author = Author(first=first, last=last)
            session.add(author)
    elif len(authors) > 1:
        raise Exception('Multiple authors found for name')

    print('Creating author {} {}'.format(first, last))
    author.gender = prompt_options('Gender?', ['M', 'F', 'NB', 'NA'])
    author.nationality = prompt('Nationality?')
    author.poc = prompt_bool('POC?')

    return author
