import json
import dateutil.parser
import sys


def extract_messages(conversation):
    messages = conversation['Conversation']['Messages']
    return [m['Message']
            for m in messages]


# delta is the maximum waiting time for a response
def find_response(messages, delta, ts):
    for m in messages:
        if m['user'] == 'Agent':
            time = dateutil.parser.parse(ts).timestamp() * 1000
            response_time = dateutil.parser.parse(
                m['timestamp']).timestamp() * 1000
            if (time + delta >= response_time) and (response_time > time):
                return True
    return False

# returns a tuple of the number of timeouts and recoveries


def recovery_counter(texts, delta):
    timeouts = 0
    recovering = False
    recoveries = 0
    for m in texts:
        if m['user'] == 'User' and not find_response(texts, delta, m['timestamp']):
            timeouts += 1
            recovering = True
        else:
            if recovering:
                recoveries += 1
                recovering = False
    return (timeouts, recoveries)


def recovery_rate(rec):
    if (rec[0] == 0):
        return 1.0
    else:
        return rec[1]/rec[0]


def run_eval(path):
    f = open(path)
    data = json.load(f)

    texts = extract_messages(data['Simulation']['Conversations'][0])

    rec = recovery_counter(texts, 300000)
    print(recovery_rate(rec))


run_eval(sys.argv[1])
