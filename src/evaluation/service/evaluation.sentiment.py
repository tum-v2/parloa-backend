import sys
import json
import spacy
from spacytextblob.spacytextblob import SpacyTextBlob
import math


def sentimentAnalysis(text):
    nlp = spacy.load('en_core_web_sm')
    nlp.add_pipe('spacytextblob')
    doc = nlp(text)
    doc._.blob.polarity

# normalize the result to [0,1]


def simgoid_normalization(result):
    return 1 / ((1+math.exp(-result)))


def messages_from_user(user, messages):
    return [m['message']['text']
            for m in messages if (m['message']['sender'].lower() == user.lower())]


def run_eval(data):
    json_data = json.loads(data)

    text = ' '.join(messages_from_user('AGENT', json_data))
    result = simgoid_normalization(sentimentAnalysis(text))
    # final result is being read from stdout
    print(result)
    sys.stdout.flush()


run_eval(sys.argv[1])
