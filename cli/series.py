from db import Series

from cli.utils import (
    prompt,
    prompt_bool,
)


def get_or_create_series(session, name):
    series = session.query(Series).filter(Series.name == name).all()
    if len(series) == 0:
        print('Creating series {}'.format(name))
        series = Series(name=name)
        session.add(series)
    elif len(series) == 1:
        if prompt_bool('Series {} found, reuse?'.format(name)):
            series = series[0]
        else:
            print('Creating series {}'.format(name))
            series = Series(name=name)
            series.add(series)
    elif len(series) > 1:
        raise Exception('Multiple series found for name')

    series_number = int(prompt('Book #?'))

    return series, series_number
