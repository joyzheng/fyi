
def prompt(prompt):
    return input(prompt)


def prompt_bool(prompt):
    resp = None
    while True:
        resp = input(prompt + ' (Y/n)')
        if resp == '' or resp == 'Y' or resp == 'y':
            return True
        elif resp == 'N' or resp == 'n':
            return False


def prompt_options(prompt, options):
    resp = None
    while True:
        resp = input(prompt + ' (' + '/'.join(options) + ')')
        for o in options:
            if o.lower() == resp.lower():
                return o


def prompt_named_options(prompt, options):
    resp = None
    while True:
        resp = input(prompt + ' (' + '/'.join(options.keys()) + ')')
        for o, v in options.items():
            if o.lower() == resp.lower() or o.lower() in v:
                return o
